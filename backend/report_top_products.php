<?php
require_once __DIR__ . '/auth_helper.php';
require_once __DIR__ . '/db.php';

jb_cors();
jb_require_role(['admin']);

$sql = "SELECT p.name,
               SUM(oi.quantity) AS units,
               SUM(oi.quantity * oi.unit_price) AS revenue
          FROM order_items oi
          JOIN product_sizes ps ON oi.product_size_id = ps.product_size_id
          JOIN products p ON ps.product_id = p.product_id
          JOIN orders o ON oi.order_id = o.order_id
         WHERE o.status IN ('paid', 'completed')
         GROUP BY p.product_id
         ORDER BY revenue DESC
         LIMIT 10";

$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to load top-products report']);
    exit;
}

$topProducts = [];
while ($row = $result->fetch_assoc()) {
    $topProducts[] = $row;
}

echo json_encode(['success' => true, 'top_products' => $topProducts]);
$result->free();
$conn->close();
?>
