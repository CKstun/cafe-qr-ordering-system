<?php

require_once __DIR__ . "/helpers.php";
set_cors_headers();
require_once __DIR__ . "/database.php";

$method = $_SERVER["REQUEST_METHOD"];

try {

    /*
     * GET /menu_items.php
     * Optional filters: ?category_id=  &search=  &availability=available|unavailable
     */
    if ($method === "GET") {

        $sql = "
            SELECT
                m.menu_item_id,
                m.category_id,
                c.category_name,
                m.product_name,
                m.description,
                m.price,
                m.image,
                m.is_available,
                m.created_at,
                m.updated_at
            FROM menu_items m
            INNER JOIN categories c
                ON m.category_id = c.category_id
            WHERE 1 = 1
        ";

        $params = [];

        if (!empty($_GET["category_id"])) {
            $sql .= " AND m.category_id = ?";
            $params[] = (int) $_GET["category_id"];
        }

        if (!empty($_GET["search"])) {
            $sql .= " AND m.product_name LIKE ?";
            $params[] = "%" . $_GET["search"] . "%";
        }

        if (!empty($_GET["availability"])) {
            if ($_GET["availability"] === "available") {
                $sql .= " AND m.is_available = 1";
            } elseif ($_GET["availability"] === "unavailable") {
                $sql .= " AND m.is_available = 0";
            }
        }

        $sql .= " ORDER BY c.category_name ASC, m.product_name ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        send_success($stmt->fetchAll());
    }

    /*
     * POST /menu_items.php
     * Add a new product.
     * Body: { category_id, product_name, description, price, image, is_available }
     */
    if ($method === "POST") {

        $body = get_json_body();
        require_fields($body, ["category_id", "product_name", "price"]);

        $stmt = $pdo->prepare("
            INSERT INTO menu_items
                (category_id, product_name, description, price, image, is_available)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            (int) $body["category_id"],
            trim($body["product_name"]),
            $body["description"] ?? null,
            (float) $body["price"],
            $body["image"] ?? null,
            isset($body["is_available"]) ? (int) (bool) $body["is_available"] : 1
        ]);

        send_success(
            ["menu_item_id" => (int) $pdo->lastInsertId()],
            "Product added.",
            201
        );
    }

    /*
     * PUT /menu_items.php
     * Update an existing product (including toggling availability).
     * Body: { menu_item_id, category_id, product_name, description, price, image, is_available }
     */
    if ($method === "PUT") {

        $body = get_json_body();
        require_fields($body, ["menu_item_id"]);

        $fields = [];
        $params = [];

        $map = [
            "category_id" => "category_id",
            "product_name" => "product_name",
            "description" => "description",
            "price" => "price",
            "image" => "image",
            "is_available" => "is_available",
        ];

        foreach ($map as $bodyKey => $column) {
            if (array_key_exists($bodyKey, $body)) {
                $fields[] = "{$column} = ?";

                if ($bodyKey === "is_available") {
                    $params[] = (int) (bool) $body[$bodyKey];
                } elseif ($bodyKey === "price") {
                    $params[] = (float) $body[$bodyKey];
                } elseif ($bodyKey === "category_id") {
                    $params[] = (int) $body[$bodyKey];
                } else {
                    $params[] = $body[$bodyKey];
                }
            }
        }

        if (empty($fields)) {
            send_error("No fields to update.", 422);
        }

        $params[] = (int) $body["menu_item_id"];

        $sql = "UPDATE menu_items SET " . implode(", ", $fields) . " WHERE menu_item_id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        send_success(null, "Product updated.");
    }

    /*
     * DELETE /menu_items.php?menu_item_id=..
     * Removes a product entirely (customizations cascade via FK).
     */
    if ($method === "DELETE") {

        if (!isset($_GET["menu_item_id"])) {
            send_error("menu_item_id is required.", 422);
        }

        $stmt = $pdo->prepare(
            "DELETE FROM menu_items WHERE menu_item_id = ?"
        );
        $stmt->execute([(int) $_GET["menu_item_id"]]);

        send_success(null, "Product removed.");
    }

    send_error("Method not allowed.", 405);

} catch (PDOException $e) {
    send_error("Database error: " . $e->getMessage(), 500);
}