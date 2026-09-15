<?php

require_once __DIR__ . "/../../config/helpers.php";
set_cors_headers();
require_once __DIR__ . "/../../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_error("Method not allowed.", 405);
}

/*
 * POST /inventory_stock.php
 * Manually record a stock change (new stocks received, spoilage/waste,
 * or a correction after a physical count).
 *
 * Body:
 * {
 *   inventory_id,
 *   transaction_type: "stock-in" | "waste" | "adjustment",
 *   quantity,     // for stock-in / waste: amount to add or remove (positive)
 *                 // for adjustment: the new, correct on-hand quantity
 *   notes
 * }
 */

$body = get_json_body();
require_fields($body, ["inventory_id", "transaction_type", "quantity"]);

$validTypes = ["stock-in", "waste", "adjustment"];

if (!in_array($body["transaction_type"], $validTypes, true)) {
    send_error("Invalid transaction_type.", 422);
}

$inventoryId = (int) $body["inventory_id"];
$type = $body["transaction_type"];
$inputQty = (float) $body["quantity"];
$notes = $body["notes"] ?? null;

try {

    $pdo->beginTransaction();

    $itemStmt = $pdo->prepare(
        "SELECT quantity, par_level, item_name FROM inventory_items WHERE inventory_id = ? FOR UPDATE"
    );
    $itemStmt->execute([$inventoryId]);
    $item = $itemStmt->fetch();

    if (!$item) {
        $pdo->rollBack();
        send_error("Inventory item not found.", 404);
    }

    $currentQty = (float) $item["quantity"];
    $loggedQty = $inputQty;

    if ($type === "stock-in") {
        $newQty = $currentQty + $inputQty;
    } elseif ($type === "waste") {
        $newQty = max(0, $currentQty - $inputQty);
        $loggedQty = -1 * $inputQty;
    } else {
        // adjustment: caller supplies the correct on-hand quantity
        $newQty = $inputQty;
        $loggedQty = $inputQty - $currentQty;
    }

    $updateStmt = $pdo->prepare(
        "UPDATE inventory_items SET quantity = ? WHERE inventory_id = ?"
    );
    $updateStmt->execute([$newQty, $inventoryId]);

    $logStmt = $pdo->prepare("
        INSERT INTO inventory_transactions
            (inventory_id, transaction_type, quantity, notes)
        VALUES (?, ?, ?, ?)
    ");
    $logStmt->execute([$inventoryId, $type, $loggedQty, $notes]);

    $pdo->commit();

    $isLowStock = $newQty <= (float) $item["par_level"];

    send_success([
        "inventory_id" => $inventoryId,
        "item_name" => $item["item_name"],
        "new_quantity" => $newQty,
        "is_low_stock" => $isLowStock
    ], $isLowStock
        ? "Stock updated. Warning: {$item['item_name']} is now at or below its minimum stock level."
        : "Stock updated."
    );

} catch (PDOException $e) {
    $pdo->rollBack();
    send_error("Database error: " . $e->getMessage(), 500);
}
