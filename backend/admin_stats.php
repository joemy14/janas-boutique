<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "cc105_boutique";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "DB connection failed"]);
    exit();
}

// Total Products
$products = $conn->query("SELECT COUNT(*) AS total FROM products");
$total_products = $products->fetch_assoc()['total'];


// Total Orders
$orders = $conn->query("SELECT COUNT(*) AS total FROM orders");
$total_orders = $orders->fetch_assoc()['total'];

// Total Earnings
$earnings = $conn->query("SELECT SUM(total_amount) AS earnings FROM orders");
$total_earnings = $earnings->fetch_assoc()['earnings'] ?? 0;

echo json_encode([
    "total_products" => (int)$total_products,
    "total_orders" => (int)$total_orders,
    "total_earnings" => (float)$total_earnings
]);

$conn->close();
