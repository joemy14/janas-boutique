<?php
// Clean start
ini_set('display_errors', 0);
error_reporting(E_ALL);
ob_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ["success" => false, "message" => "Unknown error"];

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id'])) throw new Exception("Missing product ID");

    $id = intval($data['id']);
    if ($id <= 0) throw new Exception("Invalid product ID");

    require_once __DIR__ . "/db.php";
    if (!$conn) throw new Exception("Database connection failed");

    // Fetch product image
    $stmt = $conn->prepare("SELECT image_path AS image_url FROM products WHERE product_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = $result->fetch_assoc();
    $stmt->close();

    if (!$product) throw new Exception("Product not found");

    // Delete image file from public/images/...
    $imagePath = __DIR__ . "/images/" . $product['image_url'];
    if (file_exists($imagePath)) {
        @unlink($imagePath);
    }

    // SOFT DELETE: DO NOT DELETE ROW (to avoid foreign key errors)
    $stmt = $conn->prepare("UPDATE products SET is_active = 0 WHERE product_id = ?");
    $stmt->bind_param("i", $id);

    if (!$stmt->execute()) throw new Exception($stmt->error);

    $stmt->close();
    $conn->close();

    $response = ["success" => true, "message" => "Product successfully archived (soft deleted)"];

} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

ob_end_clean();
echo json_encode($response);
