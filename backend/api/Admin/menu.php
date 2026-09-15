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

    /*
     * Get menu items
     */
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

    $menuItems = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
     * Get customization options.
     *
     * We need these for:
     * - Drink sizes
     * - Drink variants
     * - Party Tray sizes
     * - Other price-based options
     */
    $customizationSql = "
        SELECT
            customization_id,
            menu_item_id,
            option_name,
            option_group,
            option_type,
            price
        FROM customization_options
        WHERE menu_item_id = ?
        AND is_available = 1
        ORDER BY customization_id ASC
    ";

    $customizationStmt = $pdo->prepare($customizationSql);


    /*
     * Groups that normally replace the base
     * menu item price.
     */
    $priceGroups = [
        "Drink Variant",
        "Size",
        "Variant",
        "Tray Size"
    ];


    foreach ($menuItems as &$item) {

        $customizationStmt->execute([
            $item["menu_item_id"]
        ]);

        $options = $customizationStmt->fetchAll(
            PDO::FETCH_ASSOC
        );


        /*
         * Find the display/base price.
         */
        $basePrice = (float) $item["price"];


        /*
         * -------------------------------------------------
         * PARTY TRAY
         * -------------------------------------------------
         *
         * Your Party Tray data uses:
         *
         * Palabok:
         *   Small   550
         *   Medium  800
         *   Large   950
         *   XL      1100
         *
         * Baked Mac:
         *   Small   600
         *   Medium  850
         *   Large   1000
         *   XL      1200
         *
         * The option_group is "Palabok" or "Baked Mac"
         * and option_type is "size".
         *
         * Therefore, get the lowest non-zero size price.
         */
        $sizePrices = [];

        foreach ($options as $option) {

            $optionType = strtolower(
                trim((string) $option["option_type"])
            );

            $optionPrice = (float) $option["price"];

            if (
                $optionType === "size" &&
                $optionPrice > 0
            ) {
                $sizePrices[] = $optionPrice;
            }
        }


        /*
         * If size prices exist, use the lowest price
         * as the base/display price.
         */
        if (count($sizePrices) > 0) {

            sort($sizePrices, SORT_NUMERIC);

            $basePrice = $sizePrices[0];
        }


        /*
         * If the item does not have size prices,
         * check the normal price groups.
         */
        if (
            $basePrice <= 0 &&
            count($options) > 0
        ) {

            foreach ($options as $option) {

                $optionGroup = trim(
                    (string) $option["option_group"]
                );

                $optionPrice = (float) $option["price"];

                if (
                    $optionPrice > 0 &&
                    in_array(
                        $optionGroup,
                        $priceGroups,
                        true
                    )
                ) {

                    $basePrice = $optionPrice;

                    break;
                }
            }
        }


        /*
         * Return only ONE display price.
         *
         * MenuCard can now simply show:
         *
         * ₱550.00
         *
         * instead of:
         *
         * Small: ₱550.00
         * Medium: ₱800.00
         * Large: ₱950.00
         * XL: ₱1,100.00
         */
        $item["prices"] = [
            [
                "label" => "",
                "price" => number_format(
                    $basePrice,
                    2,
                    ".",
                    ""
                ),
                "is_regular" => true
            ]
        ];
    }

    unset($item);


    /*
     * Return JSON
     */
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

?>