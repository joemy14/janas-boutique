<?php
$host = "localhost";
$username = "root";
$password = "";
$dbname = "janas_boutique";

$conn = new mysqli($host, $username, $password, $dbname);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}
?>