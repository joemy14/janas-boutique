<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/db.php";

// Fetch all customers (non-admins)
$sql = "SELECT user_id AS id, first_name, last_name, email FROM users WHERE role = 'customer' ORDER BY user_id DESC";
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
