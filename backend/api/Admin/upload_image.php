<?php

require_once __DIR__ . "/helpers.php";
set_cors_headers();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_error("Method not allowed.", 405);
}

if (!isset($_FILES["image"]) || $_FILES["image"]["error"] !== UPLOAD_ERR_OK) {
    send_error("No valid image file was uploaded.", 422);
}

$allowedTypes = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp",
];

$mime = mime_content_type($_FILES["image"]["tmp_name"]);

if (!isset($allowedTypes[$mime])) {
    send_error("Only JPG, PNG, or WEBP images are allowed.", 422);
}

$uploadDir = __DIR__ . "/../../uploads/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = "menu_" . uniqid() . "." . $allowedTypes[$mime];

if (!move_uploaded_file($_FILES["image"]["tmp_name"], $uploadDir . $filename)) {
    send_error("Failed to save the uploaded image.", 500);
}

send_success(["image" => $filename], "Image uploaded.");