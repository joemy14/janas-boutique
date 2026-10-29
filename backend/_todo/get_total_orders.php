<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "db.php";

// Query total orders
$sql = "SELECT COUNT(*) AS total FROM purchases";
$result = $conn->query($sql);

// Safe fallback if query fails
$row = $result ? $result->fetch_assoc() : ["total" => 0];

// Return JSON
echo json_encode(["total_orders" => $row['total'] ?? 0]);
?>
