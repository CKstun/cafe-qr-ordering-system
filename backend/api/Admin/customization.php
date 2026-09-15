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

    if (!isset($_GET["menu_item_id"])) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "menu_item_id is required."
        ]);

        exit;
    }

    $menuItemId = (int) $_GET["menu_item_id"];

    $sql = "
        SELECT
            customization_id,
            menu_item_id,
            option_name,
            option_group,
            option_type,
            price,
            is_available
        FROM customization_options
        WHERE menu_item_id = ?
        AND is_available = 1
        ORDER BY option_group, option_type, customization_id
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$menuItemId]);

    $customizations = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );

    echo json_encode([
        "success" => true,
        "data" => $customizations
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve customization options."
    ]);
}
?>
