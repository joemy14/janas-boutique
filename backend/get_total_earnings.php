<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include "db.php";

$sql = "SELECT SUM(total_amount + shipping_cost) AS total FROM purchases";
$result = $conn->query($sql);
$row = $result->fetch_assoc();

echo json_encode(["total_earnings" => $row['total'] ?: 0]);
?>
