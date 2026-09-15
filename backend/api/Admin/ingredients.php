<?php

require_once __DIR__ . "/../../config/helpers.php";
set_cors_headers();
require_once __DIR__ . "/../../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

/*
 * Manages menu_item_ingredients: the "recipe" that links a product to
 * the inventory items it consumes, and how much of each per order.
 * This is what powers automatic inventory deduction on order
 * confirmation (see orders.php).
 */

try {

    /*
     * GET /ingredients.php?menu_item_id=..
     */
    if ($method === "GET") {

        if (!isset($_GET["menu_item_id"])) {
            send_error("menu_item_id is required.", 422);
        }

        $stmt = $pdo->prepare("
            SELECT
                mi.menu_item_ingredient_id,
                mi.menu_item_id,
                mi.inventory_id,
                mi.quantity_required,
                inv.item_name,
                inv.unit
            FROM menu_item_ingredients mi
            INNER JOIN inventory_items inv
                ON inv.inventory_id = mi.inventory_id
            WHERE mi.menu_item_id = ?
            ORDER BY inv.item_name ASC
        ");
        $stmt->execute([(int) $_GET["menu_item_id"]]);

        send_success($stmt->fetchAll());
    }

    /*
     * POST /ingredients.php
     * Body: { menu_item_id, inventory_id, quantity_required }
     */
    if ($method === "POST") {

        $body = get_json_body();
        require_fields($body, ["menu_item_id", "inventory_id", "quantity_required"]);

        $stmt = $pdo->prepare("
            INSERT INTO menu_item_ingredients
                (menu_item_id, inventory_id, quantity_required)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([
            (int) $body["menu_item_id"],
            (int) $body["inventory_id"],
            (float) $body["quantity_required"]
        ]);

        send_success(
            ["menu_item_ingredient_id" => (int) $pdo->lastInsertId()],
            "Ingredient linked.",
            201
        );
    }

    /*
     * PUT /ingredients.php
     * Body: { menu_item_ingredient_id, quantity_required }
     */
    if ($method === "PUT") {

        $body = get_json_body();
        require_fields($body, ["menu_item_ingredient_id", "quantity_required"]);

        $stmt = $pdo->prepare("
            UPDATE menu_item_ingredients
            SET quantity_required = ?
            WHERE menu_item_ingredient_id = ?
        ");
        $stmt->execute([
            (float) $body["quantity_required"],
            (int) $body["menu_item_ingredient_id"]
        ]);

        send_success(null, "Ingredient updated.");
    }

    /*
     * DELETE /ingredients.php?menu_item_ingredient_id=..
     */
    if ($method === "DELETE") {

        if (!isset($_GET["menu_item_ingredient_id"])) {
            send_error("menu_item_ingredient_id is required.", 422);
        }

        $stmt = $pdo->prepare(
            "DELETE FROM menu_item_ingredients WHERE menu_item_ingredient_id = ?"
        );
        $stmt->execute([(int) $_GET["menu_item_ingredient_id"]]);

        send_success(null, "Ingredient removed.");
    }

    send_error("Method not allowed.", 405);

} catch (PDOException $e) {
    send_error("Database error: " . $e->getMessage(), 500);
}
