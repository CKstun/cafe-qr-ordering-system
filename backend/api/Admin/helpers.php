<?php

/*
 * Shared helpers for the Admin API endpoints.
 * Keeps every endpoint file small and consistent.
 */

function set_cors_headers() {
    // Credentialed requests (cookies) require an exact origin, not "*",
    // plus Allow-Credentials so the browser will actually send/accept
    // the PHP session cookie used for admin login.
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json");

    if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
        http_response_code(200);
        exit;
    }
}

/**
 * Starts (or resumes) the PHP session used to keep an admin logged in.
 * Every admin/*.php endpoint should call this right after set_cors_headers().
 */
function start_admin_session() {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_set_cookie_params([
            "lifetime" => 60 * 60 * 8, // 8 hours
            "path" => "/",
            "samesite" => "Lax",
        ]);
        session_start();
    }
}

/**
 * Blocks the request unless an admin is currently logged in.
 * Call this at the top of any endpoint that should require authentication.
 */
function require_admin_session() {
    start_admin_session();

    if (empty($_SESSION["user_id"]) || ($_SESSION["role"] ?? null) !== "admin") {
        send_error("You must be logged in as an admin to do that.", 401);
    }
}

function get_json_body() {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function send_json($payload, $code = 200) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

function send_success($data = null, $message = null, $code = 200) {
    $payload = ["success" => true];

    if ($message !== null) {
        $payload["message"] = $message;
    }

    if ($data !== null) {
        $payload["data"] = $data;
    }

    send_json($payload, $code);
}

function send_error($message, $code = 400) {
    send_json([
        "success" => false,
        "message" => $message
    ], $code);
}

function require_fields($body, $fields) {
    foreach ($fields as $field) {
        if (!isset($body[$field]) || $body[$field] === "") {
            send_error("Field '{$field}' is required.", 422);
        }
    }
}