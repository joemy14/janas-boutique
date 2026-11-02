<?php
require_once __DIR__ . '/auth_helper.php';
jb_cors();
jb_require_role(['admin']);

header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);
ini_set('display_errors', 0);

$name = trim($_POST['name'] ?? '');
$description = trim($_POST['description'] ?? '');
$priceValue = $_POST['price'] ?? null;
$price = filter_var($priceValue, FILTER_VALIDATE_FLOAT);
$stockValue = $_POST['stock'] ?? null;
$stock = filter_var($stockValue, FILTER_VALIDATE_INT);
$folder = trim($_POST['folder'] ?? '');
$image = $_FILES['image'] ?? null;

foreach (['name', 'description', 'price', 'stock', 'folder'] as $field) {
    if (!array_key_exists($field, $_POST) || trim((string)$_POST[$field]) === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required field: {$field}"]);
        exit;
    }
}

if ($price === false || $price <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid price"]);
    exit;
}
if ($stock === false || $stock < 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid stock"]);
    exit;
}
if (!is_array($image) || ($image['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required field: image"]);
    exit;
}
if (($image['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid image upload"]);
    exit;
}

$folderParts = array_map(
    static fn($part) => preg_replace('/[^a-z0-9_-]/', '', strtolower(trim($part))),
    explode('>', $folder)
);
$categoryName = $folderParts[0] ?? '';
$allowedCategories = ['tops', 'bottoms', 'dresses', 'perfumes', 'shoes', 'accessories'];
if (!in_array($categoryName, $allowedCategories, true) || in_array('', $folderParts, true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid product category"]);
    exit;
}

require_once __DIR__ . "/db.php";

$targetDir = __DIR__ . "/images/" . implode('/', $folderParts) . '/';
if (!is_dir($targetDir) && !mkdir($targetDir, 0777, true)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to create image directory"]);
    $conn->close();
    exit;
}

$filename = basename((string)$image['name']);
$filename = preg_replace("/[^a-zA-Z0-9._-]/", "_", $filename);
$targetFile = $targetDir . $filename;
if (!move_uploaded_file($image['tmp_name'], $targetFile)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Image upload failed"]);
    $conn->close();
    exit;
}

$imagePath = '/backend/images/' . implode('/', $folderParts) . '/' . $filename;

try {
    $conn->begin_transaction();

    $categoryId = null;
    $categoryStmt = $conn->prepare("SELECT category_id FROM categories WHERE name = ? LIMIT 1");
    $categoryLabel = ucfirst($categoryName);
    $categoryStmt->bind_param("s", $categoryLabel);
    $categoryStmt->execute();
    $category = $categoryStmt->get_result()->fetch_assoc();
    $categoryStmt->close();

    if ($category) {
        $categoryId = (int)$category['category_id'];
    } else {
        $categoryStmt = $conn->prepare("INSERT INTO categories (name) VALUES (?)");
        $categoryStmt->bind_param("s", $categoryLabel);
        $categoryStmt->execute();
        $categoryId = (int)$categoryStmt->insert_id;
        $categoryStmt->close();
    }

    $stmt = $conn->prepare(
        "INSERT INTO products (category_id, name, description, price, image_path, is_active)
         VALUES (?, ?, ?, ?, ?, 1)"
    );
    $stmt->bind_param("issds", $categoryId, $name, $description, $price, $imagePath);
    $stmt->execute();
    $productId = (int)$stmt->insert_id;
    $stmt->close();

    $sizeStmt = $conn->prepare(
        "INSERT INTO product_sizes (product_id, size, stock_quantity)
         VALUES (?, 'ONE', ?)
         ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity)"
    );
    $sizeStmt->bind_param("ii", $productId, $stock);
    $sizeStmt->execute();
    $sizeStmt->close();

    $conn->commit();
    echo json_encode([
        "success" => true,
        "message" => "Product added successfully",
        "debug" => ["inserted_id" => $productId, "imageURL" => $imagePath],
    ]);
} catch (Throwable $error) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to add product"]);
}

$conn->close();
?>
