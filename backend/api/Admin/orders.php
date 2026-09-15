<?php

require_once __DIR__ . "/../../config/helpers.php";
set_cors_headers();
require_once __DIR__ . "/../../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

try {

    /*
     * GET /orders.php
     * View customer transactions.
     * - ?order_id=..            -> single order with items + customizations
     * - ?status=..               -> filter by order_status
     * - ?payment_status=..
     * - ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
     * - ?search=..               -> matches customer name or order number
     */
    if ($method === "GET") {

        if (!empty($_GET["order_id"])) {
            send_success(get_order_detail($pdo, (int) $_GET["order_id"]));
        }

        $sql = "SELECT * FROM orders WHERE 1 = 1";
        $params = [];

        if (!empty($_GET["status"])) {
            $sql .= " AND order_status = ?";
            $params[] = $_GET["status"];
        }

        if (!empty($_GET["payment_status"])) {
            $sql .= " AND payment_status = ?";
            $params[] = $_GET["payment_status"];
        }

        if (!empty($_GET["date_from"])) {
            $sql .= " AND DATE(created_at) >= ?";
            $params[] = $_GET["date_from"];
        }

        if (!empty($_GET["date_to"])) {
            $sql .= " AND DATE(created_at) <= ?";
            $params[] = $_GET["date_to"];
        }

        if (!empty($_GET["search"])) {
            $sql .= " AND (customer_name LIKE ? OR order_number LIKE ?)";
            $params[] = "%" . $_GET["search"] . "%";
            $params[] = "%" . $_GET["search"] . "%";
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        send_success($stmt->fetchAll());
    }

    /*
     * PUT /orders.php
     * Update order status / payment status (e.g. confirming an order).
     * Confirming an order (order_status -> 'confirmed') automatically
     * deducts the ingredients used from inventory.
     * Body: { order_id, order_status?, payment_status? }
     */
    if ($method === "PUT") {

        $body = get_json_body();
        require_fields($body, ["order_id"]);

        $orderId = (int) $body["order_id"];

        $orderStmt = $pdo->prepare("SELECT * FROM orders WHERE order_id = ?");
        $orderStmt->execute([$orderId]);
        $order = $orderStmt->fetch();

        if (!$order) {
            send_error("Order not found.", 404);
        }

        $pdo->beginTransaction();

        try {

            $fields = [];
            $params = [];

            if (isset($body["order_status"])) {
                $fields[] = "order_status = ?";
                $params[] = $body["order_status"];
            }

            if (isset($body["payment_status"])) {
                $fields[] = "payment_status = ?";
                $params[] = $body["payment_status"];
            }

            if (!empty($fields)) {
                $params[] = $orderId;
                $updateSql = "UPDATE orders SET " . implode(", ", $fields) . " WHERE order_id = ?";
                $pdo->prepare($updateSql)->execute($params);
            }

            /*
             * Auto-deduct inventory the moment an order is confirmed,
             * based on each product's recipe in menu_item_ingredients.
             * Only runs once per order (guarded by the status change).
             */
            $wasConfirmed = $order["order_status"] === "confirmed";
            $isNowConfirmed = isset($body["order_status"]) && $body["order_status"] === "confirmed";

            if ($isNowConfirmed && !$wasConfirmed) {
                deduct_inventory_for_order($pdo, $orderId);
            }

            $pdo->commit();

        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }

        send_success(null, "Order updated.");
    }

    send_error("Method not allowed.", 405);

} catch (PDOException $e) {
    send_error("Database error: " . $e->getMessage(), 500);
}

/*
 * Fetch one order with its line items and customizations.
 */
function get_order_detail($pdo, $orderId) {

    $orderStmt = $pdo->prepare("SELECT * FROM orders WHERE order_id = ?");
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch();

    if (!$order) {
        send_error("Order not found.", 404);
    }

    $itemsStmt = $pdo->prepare("
        SELECT order_item_id, menu_item_id, product_name, quantity, price, subtotal
        FROM order_items
        WHERE order_id = ?
    ");
    $itemsStmt->execute([$orderId]);
    $items = $itemsStmt->fetchAll();

    $customStmt = $pdo->prepare("
        SELECT customization_name, customization_type, price
        FROM order_item_customizations
        WHERE order_item_id = ?
    ");

    foreach ($items as &$item) {
        $customStmt->execute([$item["order_item_id"]]);
        $item["customizations"] = $customStmt->fetchAll();
    }
    unset($item);

    $order["items"] = $items;

    return $order;
}

/*
 * Deduct ingredient quantities from inventory for every item in an
 * order, based on menu_item_ingredients, and log each deduction.
 */
function deduct_inventory_for_order($pdo, $orderId) {

    $itemsStmt = $pdo->prepare("
        SELECT menu_item_id, quantity, product_name
        FROM order_items
        WHERE order_id = ?
    ");
    $itemsStmt->execute([$orderId]);
    $orderItems = $itemsStmt->fetchAll();

    $recipeStmt = $pdo->prepare("
        SELECT inventory_id, quantity_required
        FROM menu_item_ingredients
        WHERE menu_item_id = ?
    ");

    $deductStmt = $pdo->prepare("
        UPDATE inventory_items
        SET quantity = GREATEST(0, quantity - ?)
        WHERE inventory_id = ?
    ");

    $logStmt = $pdo->prepare("
        INSERT INTO inventory_transactions
            (inventory_id, transaction_type, quantity, notes)
        VALUES (?, 'sale', ?, ?)
    ");

    foreach ($orderItems as $orderItem) {

        $recipeStmt->execute([$orderItem["menu_item_id"]]);
        $ingredients = $recipeStmt->fetchAll();

        foreach ($ingredients as $ingredient) {

            $totalNeeded = (float) $ingredient["quantity_required"] * (int) $orderItem["quantity"];

            $deductStmt->execute([$totalNeeded, $ingredient["inventory_id"]]);

            $logStmt->execute([
                $ingredient["inventory_id"],
                -1 * $totalNeeded,
                "Order #{$orderId} - {$orderItem['product_name']}"
            ]);
        }
    }
}
