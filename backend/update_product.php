<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["success" => false, "message" => "No data received"]);
    exit;
}

$conn = new mysqli("localhost", "root", "", "cc105_boutique");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

// Validate required fields (exclude image_url)
$required = ['id', 'name', 'price', 'overview', 'features', 'stylingTip', 'folder'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        echo json_encode(["success" => false, "message" => "Missing field: $field"]);
        exit;
    }
}

// Sanitize and validate
$id = intval($data['id']);
if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid product ID"]);
    exit;
}

$name = trim($data['name']);
$overview = trim($data['overview']);
$stylingTip = trim($data['stylingTip']);
$folder = trim($data['folder']);

// Optional image_url: only update if provided
$image_url = isset($data['image_url']) ? trim($data['image_url']) : null;

// Validate price
if (!is_numeric($data['price'])) {
    echo json_encode(["success" => false, "message" => "Invalid price"]);
    exit;
}
$price = floatval($data['price']);

// Validate features as JSON array
$featuresJson = trim($data['features']);
$featuresArray = json_decode($featuresJson, true);
if (!is_array($featuresArray)) {
    echo json_encode(["success" => false, "message" => "Features must be a valid JSON array"]);
    exit;
}
$featuresJson = json_encode($featuresArray, JSON_UNESCAPED_UNICODE);

// Validate stock if provided
$stock = isset($data['stock']) ? intval($data['stock']) : null;
if ($stock !== null && !is_numeric($data['stock'])) {
    echo json_encode(["success" => false, "message" => "Invalid stock"]);
    exit;
}

// Build SQL dynamically
$sql = "UPDATE products SET name=?, price=?, overview=?, features=?, stylingTip=?, folder=?";
$params = [$name, $price, $overview, $featuresJson, $stylingTip, $folder];
$types = "sdssss";

if ($image_url !== null) {
    $sql .= ", image_url=?";
    $params[] = $image_url;
    $types .= "s";
}

if ($stock !== null) {
    $sql .= ", stock=?";
    $params[] = $stock;
    $types .= "i";
}

$sql .= " WHERE id=?";
$params[] = $id;
$types .= "i";

// Prepare and bind
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param($types, ...$params);

// Execute
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product updated"]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
