<?php

require_once __DIR__ . "/helpers.php";
set_cors_headers();
start_admin_session();
require_once __DIR__ . "/database.php";

$method = $_SERVER["REQUEST_METHOD"];

try {
    if ($method === "GET") {
        if (empty($_SESSION["user_id"]) || empty($_SESSION["role"])) {
            send_error("Not logged in.", 401);
        }

        send_success([
            "user_id" => $_SESSION["user_id"],
            "name" => $_SESSION["name"],
            "username" => $_SESSION["username"],
            "role" => $_SESSION["role"],
        ]);
    }

    if ($method === "POST") {
        $body = get_json_body();
        require_fields($body, ["username", "password"]);

        $stmt = $pdo->prepare(
            "SELECT user_id, name, username, password, role FROM users WHERE username = ? LIMIT 1"
        );
        $stmt->execute([trim($body["username"])]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($body["password"], $user["password"])) {
            send_error("Incorrect username or password.", 401);
        }

        session_regenerate_id(true);
        $_SESSION["user_id"] = (int) $user["user_id"];
        $_SESSION["name"] = $user["name"];
        $_SESSION["username"] = $user["username"];
        $_SESSION["role"] = $user["role"];

        send_success([
            "user_id" => (int) $user["user_id"],
            "name" => $user["name"],
            "username" => $user["username"],
            "role" => $user["role"],
        ], "Logged in.");
    }

    if ($method === "DELETE") {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), "", time() - 42000, $params["path"], $params["domain"] ?? "", $params["secure"], $params["httponly"] ?? false);
        }
        session_destroy();
        send_success(null, "Logged out.");
    }

    send_error("Method not allowed.", 405);
} catch (PDOException $e) {
    send_error("Database connection/query failed. Check that MySQL is running and the cafedb database exists.", 500);
}
