<?php

require_once __DIR__ . "/../../config/helpers.php";
set_cors_headers();
require_once __DIR__ . "/../../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    send_error("Method not allowed.", 405);
}

/*
 * GET /inventory_transactions.php
 * Optional: ?inventory_id=..  ?limit=..
 */

try {

    $sql = "
        SELECT
            t.transaction_id,
            t.inventory_id,
            i.item_name,
            i.unit,
            t.transaction_type,
            t.quantity,
            t.notes,
            t.created_at
        FROM inventory_transactions t
        INNER JOIN inventory_items i
            ON i.inventory_id = t.inventory_id
        WHERE 1 = 1
    ";

    $params = [];

    if (!empty($_GET["inventory_id"])) {
        $sql .= " AND t.inventory_id = ?";
        $params[] = (int) $_GET["inventory_id"];
    }

    $sql .= " ORDER BY t.created_at DESC, t.transaction_id DESC";

    $limit = isset($_GET["limit"]) ? max(1, min(500, (int) $_GET["limit"])) : 100;
    $sql .= " LIMIT {$limit}";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    send_success($stmt->fetchAll());

} catch (PDOException $e) {
    send_error("Database error: " . $e->getMessage(), 500);
}
