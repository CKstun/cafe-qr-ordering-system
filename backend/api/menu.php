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
            menu_items.menu_item_id,
            menu_items.product_name,
            menu_items.description,
            menu_items.price,
            menu_items.image,
            menu_items.is_available,
            categories.category_name
        FROM menu_items
        INNER JOIN categories
            ON menu_items.category_id = categories.category_id
        ORDER BY categories.category_name, menu_items.product_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $menuItems = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $menuItems
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve menu items."
    ]);
}