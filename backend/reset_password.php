<?php
// reset_password.php

// --- DEV ONLY: Show errors for debugging ---
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// --- CORS Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Include DB ---
include 'db.php';

// --- Get POST Data ---
$data = json_decode(file_get_contents("php://input"), true);
$token = trim($data['token'] ?? '');
$newPassword = trim($data['password'] ?? '');

if (!$token || !$newPassword) {
    echo json_encode(["success" => false, "message" => "Token and new password are required"]);
    exit;
}

// --- Check if token exists and is not expired ---
$stmt = $conn->prepare("SELECT email, expires_at FROM password_resets WHERE token = ?");
$stmt->bind_param("s", $token);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Database error: failed to verify token"]);
    exit;
}

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid or used token"]);
    exit;
}

$row = $result->fetch_assoc();

if (strtotime($row['expires_at']) < time()) {
    echo json_encode(["success" => false, "message" => "Token has expired"]);
    exit;
}

$email = $row['email'];

// --- Hash the new password ---
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// --- Update user's password ---
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$stmt->bind_param("ss", $hashedPassword, $email);
if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Failed to update password"]);
    exit;
}

// --- Delete token after use ---
$stmt = $conn->prepare("DELETE FROM password_resets WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute(); // ignore failure here, not critical

echo json_encode(["success" => true, "message" => "Password has been reset successfully"]);
?>
