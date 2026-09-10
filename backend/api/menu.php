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
            COALESCE(
                NULLIF(menu_items.price, 0),
                (
                    SELECT MIN(co.price)
                    FROM customization_options co
                    WHERE co.menu_item_id = menu_items.menu_item_id
                    AND co.is_available = 1
                    AND co.price > 0
                )
            ) AS price,
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

    $menuItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($menuItems as &$item) {

        $customizationSql = "
            SELECT
                option_name,
                option_group,
                option_type,
                price
            FROM customization_options
            WHERE menu_item_id = ?
            AND is_available = 1
            AND option_group = 'Drink Variant'
            ORDER BY customization_id ASC
        ";

        $customizationStmt = $pdo->prepare($customizationSql);
        $customizationStmt->execute([
            $item["menu_item_id"]
        ]);

        $prices = $customizationStmt->fetchAll(PDO::FETCH_ASSOC);

        $item["prices"] = [];

        foreach ($prices as $priceOption) {
            $item["prices"][] = [
                "label" => $priceOption["option_name"],
                "price" => $priceOption["price"],
                "is_regular" => stripos(
                    $priceOption["option_name"],
                    "Regular"
                ) !== false
            ];
        }
    }

    unset($item);

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