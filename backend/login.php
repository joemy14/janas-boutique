<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    echo json_encode(["success" => false, "message" => "Email and password required"]);
    exit;
}

$conn = new mysqli("localhost", "root", "", "janas_boutique");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT user_id, first_name, last_name, password_hash, role, is_active
       FROM users WHERE email = ?"
);
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

// Same message for wrong email or wrong password (don't reveal which)
if (!$user || !password_verify($password, $user['password_hash'])) {
    echo json_encode(["success" => false, "message" => "Invalid email or password"]);
    $conn->close();
    exit;
}

if ((int)$user['is_active'] !== 1) {
    echo json_encode(["success" => false, "message" => "This account is disabled"]);
    $conn->close();
    exit;
}

echo json_encode([
    "success" => true,
    "user" => [
        "id"        => $user['user_id'],
        "firstName" => $user['first_name'],
        "lastName"  => $user['last_name'],
        "email"     => $email,
        "role"      => $user['role']   // admin, staff, or customer
    ]
]);

$stmt->close();
$conn->close();