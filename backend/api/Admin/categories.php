<?php

require_once __DIR__ . "/helpers.php";
set_cors_headers();
require_once __DIR__ . "/database.php";

$method = $_SERVER["REQUEST_METHOD"];

try {

    /*
     * GET /categories.php
     * List all categories with how many menu items belong to each.
     */
    if ($method === "GET") {

        $sql = "
            SELECT
                c.category_id,
                c.category_name,
                c.created_at,
                COUNT(m.menu_item_id) AS item_count
            FROM categories c
            LEFT JOIN menu_items m
                ON m.category_id = c.category_id
            GROUP BY c.category_id, c.category_name, c.created_at
            ORDER BY c.category_name ASC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        send_success($stmt->fetchAll());
    }

    /*
     * POST /categories.php
     * Create a new category.
     * Body: { category_name }
     */
    if ($method === "POST") {

        $body = get_json_body();
        require_fields($body, ["category_name"]);

        $stmt = $pdo->prepare(
            "INSERT INTO categories (category_name) VALUES (?)"
        );
        $stmt->execute([trim($body["category_name"])]);

        send_success(
            ["category_id" => (int) $pdo->lastInsertId()],
            "Category created.",
            201
        );
    }

    /*
     * PUT /categories.php
     * Update a category name.
     * Body: { category_id, category_name }
     */
    if ($method === "PUT") {

        $body = get_json_body();
        require_fields($body, ["category_id", "category_name"]);

        $stmt = $pdo->prepare(
            "UPDATE categories SET category_name = ? WHERE category_id = ?"
        );
        $stmt->execute([
            trim($body["category_name"]),
            (int) $body["category_id"]
        ]);

        send_success(null, "Category updated.");
    }

    /*
     * DELETE /categories.php?category_id=..
     */
    if ($method === "DELETE") {

        if (!isset($_GET["category_id"])) {
            send_error("category_id is required.", 422);
        }

        $categoryId = (int) $_GET["category_id"];

        $checkStmt = $pdo->prepare(
            "SELECT COUNT(*) FROM menu_items WHERE category_id = ?"
        );
        $checkStmt->execute([$categoryId]);

        if ((int) $checkStmt->fetchColumn() > 0) {
            send_error(
                "Cannot delete a category that still has menu items assigned to it.",
                409
            );
        }

        $stmt = $pdo->prepare(
            "DELETE FROM categories WHERE category_id = ?"
        );
        $stmt->execute([$categoryId]);

        send_success(null, "Category deleted.");
    }

    send_error("Method not allowed.", 405);

} catch (PDOException $e) {
    send_error("Database error: " . $e->getMessage(), 500);
}