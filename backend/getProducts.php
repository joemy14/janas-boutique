<?php
require_once __DIR__ . '/auth_helper.php';
jb_cors();

header("Content-Type: application/json");
require_once __DIR__ . "/db.php";

// Optional category filter, e.g. ?folder=tops
$folder = isset($_GET['folder']) ? trim($_GET['folder']) : '';

$sql = "SELECT p.product_id AS id,
               p.name,
               p.price,
               p.image_path AS image_url,
               p.description AS overview,
               c.name AS folder,
               COALESCE(SUM(ps.stock_quantity), 0) AS stock,
               GROUP_CONCAT(DISTINCT CASE WHEN ps.stock_quantity > 0 THEN ps.size END) AS available_sizes
          FROM products p
          JOIN categories c ON c.category_id = p.category_id
          LEFT JOIN product_sizes ps ON ps.product_id = p.product_id
         WHERE p.is_active = 1";

if ($folder !== '') {
    $sql .= " AND c.name = ?";
}
$sql .= " GROUP BY p.product_id, p.name, p.price, p.image_path, p.description, c.name
          ORDER BY p.product_id";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
    exit;
}
if ($folder !== '') {
    $stmt->bind_param("s", $folder);
}
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $row['price'] = (float)$row['price'];
    $row['stock'] = (int)$row['stock'];
    $availableSizes = $row['available_sizes'] ? explode(',', $row['available_sizes']) : [];
    $sizeOrder = ['S', 'M', 'L', 'XL', 'ONE'];
    $row['available_sizes'] = array_values(array_intersect($sizeOrder, $availableSizes));
    $row['features'] = null;     // not in the new schema yet
    $row['stylingTip'] = null;   // not in the new schema yet
    $products[] = $row;
}

echo json_encode(["success" => true, "products" => $products]);

$stmt->close();
$conn->close();
?>
