<?php

require_once __DIR__ . "/../../config/helpers.php";
set_cors_headers();
require_once __DIR__ . "/../../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

try {

    /*
     * GET /customizations.php?menu_item_id=..
     * Lists every customization option for one product, including
     * unavailable ones (unlike the customer-facing endpoint).
     */
    if ($method === "GET") {

        if (!isset($_GET["menu_item_id"])) {
            send_error("menu_item_id is required.", 422);
        }

        $stmt = $pdo->prepare("
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
            ORDER BY option_group ASC, option_type ASC, customization_id ASC
        ");
        $stmt->execute([(int) $_GET["menu_item_id"]]);

        send_success($stmt->fetchAll());
    }

    /*
     * POST /customizations.php
     * Add a new customization option to a product.
     * Body: { menu_item_id, option_name, option_group, option_type, price, is_available }
     */
    if ($method === "POST") {

        $body = get_json_body();
        require_fields($body, ["menu_item_id", "option_name", "option_type"]);

        $validTypes = ["size", "sugar", "topping", "add-on", "other"];

        if (!in_array($body["option_type"], $validTypes, true)) {
            send_error("Invalid option_type.", 422);
        }

        $stmt = $pdo->prepare("
            INSERT INTO customization_options
                (menu_item_id, option_name, option_group, option_type, price, is_available)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            (int) $body["menu_item_id"],
            trim($body["option_name"]),
            $body["option_group"] ?? "General",
            $body["option_type"],
            (float) ($body["price"] ?? 0),
            isset($body["is_available"]) ? (int) (bool) $body["is_available"] : 1
        ]);

        send_success(
            ["customization_id" => (int) $pdo->lastInsertId()],
            "Customization option added.",
            201
        );
    }

    /*
     * PUT /customizations.php
     * Body: { customization_id, option_name, option_group, option_type, price, is_available }
     */
    if ($method === "PUT") {

        $body = get_json_body();
        require_fields($body, ["customization_id"]);

        $fields = [];
        $params = [];

        $map = [
            "option_name" => "option_name",
            "option_group" => "option_group",
            "option_type" => "option_type",
            "price" => "price",
            "is_available" => "is_available",
        ];

        foreach ($map as $bodyKey => $column) {
            if (array_key_exists($bodyKey, $body)) {
                $fields[] = "{$column} = ?";

                if ($bodyKey === "is_available") {
                    $params[] = (int) (bool) $body[$bodyKey];
                } elseif ($bodyKey === "price") {
                    $params[] = (float) $body[$bodyKey];
                } else {
                    $params[] = $body[$bodyKey];
                }
            }
        }

        if (empty($fields)) {
            send_error("No fields to update.", 422);
        }

        $params[] = (int) $body["customization_id"];

        $sql = "UPDATE customization_options SET " . implode(", ", $fields) . " WHERE customization_id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        send_success(null, "Customization option updated.");
    }

    /*
     * DELETE /customizations.php?customization_id=..
     */
    if ($method === "DELETE") {

        if (!isset($_GET["customization_id"])) {
            send_error("customization_id is required.", 422);
        }

        $stmt = $pdo->prepare(
            "DELETE FROM customization_options WHERE customization_id = ?"
        );
        $stmt->execute([(int) $_GET["customization_id"]]);

        send_success(null, "Customization option removed.");
    }

    send_error("Method not allowed.", 405);

} catch (PDOException $e) {
    send_error("Database error: " . $e->getMessage(), 500);
}
