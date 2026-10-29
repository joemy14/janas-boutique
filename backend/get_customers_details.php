<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "cc105_boutique");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit();
}

// Fetch all customers (non-admins)
$sql = "SELECT id, first_name, last_name, email FROM users WHERE is_admin = 0 ORDER BY id DESC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(['success' => false, 'message' => $conn->error]);
    exit();
}

$customers = [];
while ($row = $result->fetch_assoc()) {
    $customers[] = $row;
}

echo json_encode(['success' => true, 'customers' => $customers]);
$conn->close();
