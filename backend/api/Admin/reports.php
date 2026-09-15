<?php

require_once __DIR__ . "/../../config/helpers.php";
set_cors_headers();
require_once __DIR__ . "/../../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    send_error("Method not allowed.", 405);
}

/*
 * GET /reports.php
 * ?period=daily|weekly|monthly   (defaults the date range)
 * ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD   (overrides period, for
 *   "Generate sales reports based on a selected date range")
 */

try {

    $today = new DateTime();

    if (!empty($_GET["date_from"]) && !empty($_GET["date_to"])) {
        $dateFrom = $_GET["date_from"];
        $dateTo = $_GET["date_to"];
    } else {
        $period = $_GET["period"] ?? "daily";

        $dateTo = $today->format("Y-m-d");

        if ($period === "weekly") {
            $dateFrom = (clone $today)->modify("-6 days")->format("Y-m-d");
        } elseif ($period === "monthly") {
            $dateFrom = (clone $today)->modify("-29 days")->format("Y-m-d");
        } else {
            $dateFrom = $dateTo;
        }
    }

    /* Only completed orders count toward sales figures */
    $summaryStmt = $pdo->prepare("
        SELECT
            COALESCE(SUM(total_amount), 0) AS total_sales,
            COUNT(*) AS completed_orders
        FROM orders
        WHERE order_status = 'completed'
        AND DATE(created_at) BETWEEN ? AND ?
    ");
    $summaryStmt->execute([$dateFrom, $dateTo]);
    $summary = $summaryStmt->fetch();

    /* Quantity of products sold in the range */
    $qtyStmt = $pdo->prepare("
        SELECT COALESCE(SUM(oi.quantity), 0) AS quantity_sold
        FROM order_items oi
        INNER JOIN orders o ON o.order_id = oi.order_id
        WHERE o.order_status = 'completed'
        AND DATE(o.created_at) BETWEEN ? AND ?
    ");
    $qtyStmt->execute([$dateFrom, $dateTo]);
    $quantitySold = (int) $qtyStmt->fetchColumn();

    /* Best-selling products */
    $bestSellersStmt = $pdo->prepare("
        SELECT
            oi.menu_item_id,
            oi.product_name,
            SUM(oi.quantity) AS quantity_sold,
            SUM(oi.subtotal) AS revenue
        FROM order_items oi
        INNER JOIN orders o ON o.order_id = oi.order_id
        WHERE o.order_status = 'completed'
        AND DATE(o.created_at) BETWEEN ? AND ?
        GROUP BY oi.menu_item_id, oi.product_name
        ORDER BY quantity_sold DESC
        LIMIT 10
    ");
    $bestSellersStmt->execute([$dateFrom, $dateTo]);
    $bestSellers = $bestSellersStmt->fetchAll();

    /* Sales broken down by day, for charting */
    $byDayStmt = $pdo->prepare("
        SELECT
            DATE(created_at) AS sales_date,
            COALESCE(SUM(total_amount), 0) AS total_sales,
            COUNT(*) AS completed_orders
        FROM orders
        WHERE order_status = 'completed'
        AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY sales_date ASC
    ");
    $byDayStmt->execute([$dateFrom, $dateTo]);
    $salesByDay = $byDayStmt->fetchAll();

    send_success([
        "date_from" => $dateFrom,
        "date_to" => $dateTo,
        "total_sales" => (float) $summary["total_sales"],
        "completed_orders" => (int) $summary["completed_orders"],
        "quantity_sold" => $quantitySold,
        "best_sellers" => $bestSellers,
        "sales_by_day" => $salesByDay,
    ]);

} catch (PDOException $e) {
    send_error("Database error: " . $e->getMessage(), 500);
}
