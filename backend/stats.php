<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/db.php";

$products = $conn->query("SELECT COUNT(*) AS n FROM products WHERE is_active = 1")->fetch_assoc()['n'];
$orders   = $conn->query("SELECT COUNT(*) AS n FROM orders WHERE status <> 'cancelled'")->fetch_assoc()['n'];
$earnings = $conn->query("SELECT COALESCE(SUM(total_amount), 0) AS n FROM orders WHERE status IN ('paid','completed')")->fetch_assoc()['n'];

echo json_encode([
    "total_products" => (int)$products,
    "total_orders"   => (int)$orders,
    "total_earnings" => (float)$earnings
]);
$conn->close();