<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"), true);

$product_id = $data['id'] ?? 0;
$new_stock  = $data['stock'] ?? null;

if (!$product_id || $new_stock === null) {
    echo json_encode(['success' => false, 'message' => 'Product ID and stock are required']);
    exit();
}

require_once __DIR__ . "/db.php";

// Update stock
$stmt = $conn->prepare("UPDATE products SET stock=? WHERE id=?");
$stmt->bind_param("ii", $new_stock, $product_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Stock updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update stock']);
}

$stmt->close();
$conn->close();
