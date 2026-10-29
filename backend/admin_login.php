<?php
// --- CORS Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL); 

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

// Check if user exists
$stmt = $conn->prepare("SELECT password, is_admin FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid email or password"]);
    exit;
}

$user = $result->fetch_assoc();

// Check password
if (!password_verify($password, $user['password'])) {
    echo json_encode(["success" => false, "message" => "Invalid email or password"]);
    exit;
}

// Check if admin
if ($user['is_admin'] != 1) {
    echo json_encode(["success" => false, "message" => "Access denied: not an admin"]);
    exit;
}

// Success
echo json_encode(["success" => true, "message" => "Admin login successful"]);
