<?php

require_once __DIR__ . "/../../config/helpers.php";
set_cors_headers();
require_once __DIR__ . "/../../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

try {

    /*
     * GET /inventory.php
     * Optional: ?status=low  to only return items at/under par level.
     * Every item includes a computed "status" (ok | low) so the
     * frontend never has to duplicate that logic.
     */
    if ($method === "GET") {

        $sql = "
            SELECT
                inventory_id,
                item_name,
                unit,
                quantity,
                par_level,
                created_at,
                updated_at,
                CASE
                    WHEN quantity <= par_level THEN 'low'
                    ELSE 'ok'
                END AS status
            FROM inventory_items
        ";

        if (!empty($_GET["status"]) && $_GET["status"] === "low") {
            $sql .= " WHERE quantity <= par_level";
        }

        $sql .= " ORDER BY item_name ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        send_success($stmt->fetchAll());
    }

    /*
     * POST /inventory.php
     * Add a new inventory item.
     * Body: { item_name, unit, quantity, par_level }
     */
    if ($method === "POST") {

        $body = get_json_body();
        require_fields($body, ["item_name", "unit"]);

        $stmt = $pdo->prepare("
            INSERT INTO inventory_items
                (item_name, unit, quantity, par_level)
            VALUES (?, ?, ?, ?)
        ");

        $startingQty = (float) ($body["quantity"] ?? 0);

        $stmt->execute([
            trim($body["item_name"]),
            trim($body["unit"]),
            $startingQty,
            (float) ($body["par_level"] ?? 0)
        ]);

        $inventoryId = (int) $pdo->lastInsertId();

        /*
         * Log the initial stock as a stock-in transaction so the
         * history stays complete from day one.
         */
        if ($startingQty > 0) {
            $logStmt = $pdo->prepare("
                INSERT INTO inventory_transactions
                    (inventory_id, transaction_type, quantity, notes)
                VALUES (?, 'stock-in', ?, 'Initial stock')
            ");
            $logStmt->execute([$inventoryId, $startingQty]);
        }

        send_success(
            ["inventory_id" => $inventoryId],
            "Inventory item added.",
            201
        );
    }

    /*
     * PUT /inventory.php
     * Edits item details (name / unit / minimum stock level).
     * To change quantity, use inventory_stock.php instead so every
     * quantity change is logged in the stock history.
     * Body: { inventory_id, item_name, unit, par_level }
     */
    if ($method === "PUT") {

        $body = get_json_body();
        require_fields($body, ["inventory_id"]);

        $fields = [];
        $params = [];

        $map = [
            "item_name" => "item_name",
            "unit" => "unit",
            "par_level" => "par_level",
        ];

        foreach ($map as $bodyKey => $column) {
            if (array_key_exists($bodyKey, $body)) {
                $fields[] = "{$column} = ?";
                $params[] = $bodyKey === "par_level"
                    ? (float) $body[$bodyKey]
                    : $body[$bodyKey];
            }
        }

        if (empty($fields)) {
            send_error("No fields to update.", 422);
        }

        $params[] = (int) $body["inventory_id"];

        $sql = "UPDATE inventory_items SET " . implode(", ", $fields) . " WHERE inventory_id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        send_success(null, "Inventory item updated.");
    }

    /*
     * DELETE /inventory.php?inventory_id=..
     */
    if ($method === "DELETE") {

        if (!isset($_GET["inventory_id"])) {
            send_error("inventory_id is required.", 422);
        }

        $stmt = $pdo->prepare(
            "DELETE FROM inventory_items WHERE inventory_id = ?"
        );
        $stmt->execute([(int) $_GET["inventory_id"]]);

        send_success(null, "Inventory item deleted.");
    }

    send_error("Method not allowed.", 405);

} catch (PDOException $e) {
    send_error("Database error: " . $e->getMessage(), 500);
}
