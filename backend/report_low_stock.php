<?php
require_once __DIR__ . '/auth_helper.php';
require_once __DIR__ . '/db.php';

jb_cors();
jb_require_role(['admin', 'staff']);

$sql = 'SELECT * FROM v_low_stock ORDER BY stock_quantity ASC';
$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to load low-stock report']);
    exit;
}

$lowStock = [];
while ($row = $result->fetch_assoc()) {
    $lowStock[] = $row;
}

echo json_encode(['success' => true, 'low_stock' => $lowStock]);
$result->free();
$conn->close();
?>
