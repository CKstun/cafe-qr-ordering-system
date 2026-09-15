<?php
session_start();
require __DIR__ . "/database.php";

if (!empty($_SESSION["user_id"]) && !empty($_SESSION["role"])) {
    header("Location: index.html");
    exit;
}

$error = "";
$success = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    $username = trim($_POST["username"] ?? "");
    $password = $_POST["password"] ?? "";
    $confirm = $_POST["confirm_password"] ?? "";
    $role = $_POST["role"] ?? "cashier";

    if ($name === "" || $username === "" || $password === "" || $confirm === "") {
        $error = "Please complete all fields.";
    } elseif (strlen($username) < 3 || strlen($username) > 50) {
        $error = "Username must be 3–50 characters.";
    } elseif (!preg_match('/^[A-Za-z0-9._-]+$/', $username)) {
        $error = "Username may only contain letters, numbers, dot, underscore, and hyphen.";
    } elseif (!in_array($role, ["admin", "cashier"], true)) {
        $error = "Please select a valid account type.";
    } elseif (strlen($password) < 8) {
        $error = "Password must be at least 8 characters.";
    } elseif ($password !== $confirm) {
        $error = "Passwords do not match.";
    } else {
        try {
            $check = $pdo->prepare("SELECT user_id FROM users WHERE username = ? LIMIT 1");
            $check->execute([$username]);
            if ($check->fetch()) {
                $error = "That username is already taken.";
            } else {
                $stmt = $pdo->prepare("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)");
                $stmt->execute([$name, $username, password_hash($password, PASSWORD_DEFAULT), $role]);
                $label = $role === "admin" ? "Admin" : "Staff";
                $success = $label . " account created successfully. You can now log in.";
            }
        } catch (PDOException $e) {
            $error = "Could not create the account. Make sure the users table exists in cafedb.";
        }
    }
}
?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Café Pepita Staff Registration</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f5dc;font:15px Arial;color:#2b211d;padding:18px}.card{width:min(410px,100%);background:#fff;border:1px solid #dfd2c2;padding:30px}.brand{font-weight:bold;letter-spacing:2px;color:#3b201a}h1{font-size:24px}form{display:grid;gap:13px}label{display:grid;gap:6px;color:#89796f}input{padding:12px;border:1px solid #d8c9b8;border-radius:3px}button{padding:12px;background:#3b201a;color:white;border:0;cursor:pointer}.error{color:#9b3027}.success{color:#26733b}a{color:#3b201a}
</style></head><body><section class="card"><div class="brand">CAFÉ PEPITA</div><p style="color:#89796f">Admin &amp; Staff Portal</p><h1>Create account</h1>
<?php if($error): ?><p class="error"><?=htmlspecialchars($error,ENT_QUOTES,"UTF-8")?></p><?php endif; ?><?php if($success): ?><p class="success"><?=htmlspecialchars($success,ENT_QUOTES,"UTF-8")?></p><?php endif; ?>
<form method="post" action="register.php"><label>Full name<input name="name" maxlength="100" autocomplete="name" required></label><label>Username<input name="username" minlength="3" maxlength="50" autocomplete="username" required></label><label>Account type<select name="role" required style="padding:12px;border:1px solid #d8c9b8;border-radius:3px;background:#fff"><option value="cashier">Staff</option><option value="admin">Admin</option></select></label><label>Password<input type="password" name="password" minlength="8" autocomplete="new-password" required></label><label>Confirm password<input type="password" name="confirm_password" minlength="8" autocomplete="new-password" required></label><button type="submit">Create account</button></form>
<p style="text-align:center;margin-top:18px"><a href="index.html">Back to login</a></p></section></body></html>
