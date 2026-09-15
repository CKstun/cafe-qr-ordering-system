<?php
session_start();
require __DIR__ . "/database.php";

if (!empty($_SESSION["user_id"]) && !empty($_SESSION["role"])) {
    header("Location: index.html");
    exit;
}

$error = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST["username"] ?? "");
    $password = $_POST["password"] ?? "";

    if ($username === "" || $password === "") {
        $error = "Enter your username and password.";
    } else {
        try {
            $stmt = $pdo->prepare("SELECT user_id, name, username, password, role FROM users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user["password"])) {
                session_regenerate_id(true);
                $_SESSION["user_id"] = (int) $user["user_id"];
                $_SESSION["name"] = $user["name"];
                $_SESSION["username"] = $user["username"];
                $_SESSION["role"] = $user["role"];
                header("Location: index.html");
                exit;
            }
            $error = "Invalid username or password.";
        } catch (PDOException $e) {
            $error = "Database connection failed. Make sure MySQL is running and cafedb exists.";
        }
    }
}
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Café Pepita Login</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f5dc;font:15px Arial;color:#2b211d;padding:18px}
.card{width:min(410px,100%);background:#fff;border:1px solid #dfd2c2;padding:30px}.brand{font-weight:bold;letter-spacing:2px;color:#3b201a}h1{font-size:24px}
form{display:grid;gap:13px}label{display:grid;gap:6px;color:#89796f}input{padding:12px;border:1px solid #d8c9b8;border-radius:3px}button{padding:12px;background:#3b201a;color:white;border:0;cursor:pointer}.error{color:#9b3027}a{color:#3b201a}
</style></head><body><section class="card">
<div class="brand">CAFÉ PEPITA</div><p style="color:#89796f">Admin &amp; Staff Portal</p><h1>Log in</h1>
<?php if ($error): ?><p class="error"><?= htmlspecialchars($error, ENT_QUOTES, "UTF-8") ?></p><?php endif; ?>
<form method="post" action="login.php">
<label>Username<input name="username" autocomplete="username" required></label>
<label>Password<input type="password" name="password" autocomplete="current-password" required></label>
<button type="submit">Log in</button></form>
<p style="margin-top:18px;text-align:center">Staff member? <a href="register.php">Create an account</a></p>
<p style="font-size:12px;color:#89796f;text-align:center">Accounts are saved in the Café Pepita database.</p>
</section></body></html>
