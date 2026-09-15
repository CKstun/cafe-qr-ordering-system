<?php

require_once __DIR__ . "/../../config/helpers.php";
set_cors_headers();
require_once __DIR__ . "/../../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    send_error("Method not allowed.", 405);
}

try {

    /* Active orders currently in the queue */
    $activeStmt = $pdo->query("
        SELECT COUNT(*) FROM orders
        WHERE order_status IN ('pending', 'confirmed', 'preparing', 'ready')
    ");
    $activeOrders = (int) $activeStmt->fetchColumn();

    /* Revenue today (paid orders only) */
    $revenueStmt = $pdo->query("
        SELECT COALESCE(SUM(total_amount), 0) FROM orders
        WHERE payment_status = 'paid'
        AND DATE(created_at) = CURDATE()
    ");
    $revenueToday = (float) $revenueStmt->fetchColumn();

    /* Low stock alerts */
    $lowStockStmt = $pdo->query("
        SELECT COUNT(*) FROM inventory_items WHERE quantity <= par_level
    ");
    $lowStockCount = (int) $lowStockStmt->fetchColumn();

    /* Menu items */
    $menuStmt = $pdo->query("
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN is_available = 0 THEN 1 ELSE 0 END) AS unavailable
        FROM menu_items
    ");
    $menuCounts = $menuStmt->fetch();

    /* Order queue breakdown (today) */
    $queueStmt = $pdo->query("
        SELECT order_status, COUNT(*) AS total
        FROM orders
        WHERE DATE(created_at) = CURDATE()
        GROUP BY order_status
    ");
    $queueRows = $queueStmt->fetchAll();

    $orderQueue = [
        "pending" => 0,
        "preparing" => 0,
        "ready" => 0,
        "completed" => 0,
    ];

    foreach ($queueRows as $row) {
        if (array_key_exists($row["order_status"], $orderQueue)) {
            $orderQueue[$row["order_status"]] = (int) $row["total"];
        }
    }

    /* Recent transactions */
    $recentStmt = $pdo->query("
        SELECT order_id, order_number, customer_name, payment_method,
               payment_status, total_amount, order_status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 6
    ");
    $recentTransactions = $recentStmt->fetchAll();

    send_success([
        "active_orders" => $activeOrders,
        "revenue_today" => $revenueToday,
        "low_stock_count" => $lowStockCount,
        "menu_items_total" => (int) $menuCounts["total"],
        "menu_items_unavailable" => (int) $menuCounts["unavailable"],
        "order_queue" => $orderQueue,
        "recent_transactions" => $recentTransactions,
    ]);

} catch (PDOException $e) {
    send_error("Database error: " . $e->getMessage(), 500);
}
