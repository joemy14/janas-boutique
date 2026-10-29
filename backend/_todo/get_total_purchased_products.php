<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include "db.php";

// Sum the quantity column to get total products purchased
$sql = "SELECT SUM(quantity) AS total_products FROM purchase_items";
$result = $conn->query($sql);
$row = $result->fetch_assoc();

echo json_encode(["total_products" => (int)($row['total_products'] ?? 0)]);
?>
