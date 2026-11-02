<?php
require_once __DIR__ . '/auth_helper.php';
jb_cors();
jb_require_role(['admin']);

header("Content-Type: application/json; charset=utf-8");
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON request"]);
    exit;
}

$id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
$name = trim((string)($data['name'] ?? ''));
$description = trim((string)($data['overview'] ?? ''));
$price = filter_var($data['price'] ?? null, FILTER_VALIDATE_FLOAT);
$folder = trim((string)($data['folder'] ?? ''));
$stockProvided = array_key_exists('stock', $data) && $data['stock'] !== null;
$stock = $stockProvided ? filter_var($data['stock'], FILTER_VALIDATE_INT) : null;
$imagePath = isset($data['image_url']) ? trim((string)$data['image_url']) : null;

if ($id === false || $id < 1 || $name === '' || $price === false || $price < 0 ||
    ($stockProvided && ($stock === false || $stock < 0))) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid product fields"]);
    exit;
}

$folderParts = array_map(
    static fn($part) => preg_replace('/[^a-z0-9_-]/', '', strtolower(trim($part))),
    explode('>', $folder)
);
$categoryName = $folderParts[0] ?? '';
$allowedCategories = ['tops', 'bottoms', 'dresses', 'perfumes', 'shoes', 'accessories'];
if (!in_array($categoryName, $allowedCategories, true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid product category"]);
    exit;
}

require_once __DIR__ . "/db.php";

try {
    $conn->begin_transaction();

    $categoryLabel = ucfirst($categoryName);
    $categoryStmt = $conn->prepare("SELECT category_id FROM categories WHERE name = ? LIMIT 1");
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

    $sql = "UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, is_active = 1";
    if ($imagePath !== null) {
        $sql .= ", image_path = ?";
    }
    $sql .= " WHERE product_id = ?";

    $stmt = $conn->prepare($sql);
    if ($imagePath !== null) {
        $stmt->bind_param("ssdisi", $name, $description, $price, $categoryId, $imagePath, $id);
    } else {
        $stmt->bind_param("ssdii", $name, $description, $price, $categoryId, $id);
    }
    $stmt->execute();
    $stmt->close();

    if ($stockProvided) {
        $sizeStmt = $conn->prepare(
            "INSERT INTO product_sizes (product_id, size, stock_quantity)
             VALUES (?, 'ONE', ?)
             ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity)"
        );
        $sizeStmt->bind_param("ii", $id, $stock);
        $sizeStmt->execute();
        $sizeStmt->close();
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Product updated"]);
} catch (Throwable $error) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to update product"]);
}

$conn->close();
?>
