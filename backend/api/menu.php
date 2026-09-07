<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../config/database.php";

try {

    $sql = "
        SELECT
            m.menu_item_id,
            m.product_name,
            m.category_id,
            c.category_name,
            m.price
        FROM menu_items m
        INNER JOIN categories c
            ON m.category_id = c.category_id
        ORDER BY c.category_name, m.product_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $menuItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $menuItems
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}