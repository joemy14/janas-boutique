<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email and password required"]);
    exit;
}

$conn = new mysqli("localhost", "root", "", "cc105_boutique");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, first_name, last_name, password, is_admin FROM users WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {

    // ❌ Block admins from logging in as normal users
    if ($user['is_admin'] == 1) {
        echo json_encode([
            "success" => false,
            "message" => "This account is for admin login only."
        ]);
        exit;
    }

    // ✔ Check password
    if (password_verify($password, $user['password'])) {
        echo json_encode([
            "success" => true,
            "user" => [
                "id" => $user['id'],
                "firstName" => $user['first_name'],
                "lastName" => $user['last_name'],
                "email" => $email,
                "is_admin" => 0
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password"]);
    }

} else {
    echo json_encode(["success" => false, "message" => "User not found"]);
}

$conn->close();
?>
