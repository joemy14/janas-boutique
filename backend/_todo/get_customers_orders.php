<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "cc105_boutique");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit();
}

$id = $_GET['id'] ?? '';
if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Customer ID missing']);
    exit();
}

// First, fetch customer info
$customerResult = $conn->query("SELECT id, first_name, last_name, email FROM users WHERE id = $id AND is_admin = 0");
if (!$customerResult || $customerResult->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Customer not found']);
    exit();
}
$customer = $customerResult->fetch_assoc();

// Fetch customer orders
$sql = "
SELECT p.id AS order_id, p.total_amount, p.purchase_date, p.payment_method,
       oi.product_id, pr.name AS product_name, pr.image_url AS product_image, pr.folder, oi.quantity
FROM purchases p
LEFT JOIN order_items oi ON p.id = oi.purchase_id
LEFT JOIN products pr ON oi.product_id = pr.id
WHERE p.user_email = '{$customer['email']}'
ORDER BY p.purchase_date DESC
";

$result = $conn->query($sql);
$orders = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $order_id = $row['order_id'];

        if (!isset($orders[$order_id])) {
            $orders[$order_id] = [
                'id' => $row['order_id'],
                'total_amount' => $row['total_amount'],
                'purchase_date' => $row['purchase_date'],
                'payment_method' => $row['payment_method'],
                'products' => []
            ];
        }

        if ($row['product_id']) {
            $imageFile = basename($row['product_image']);
            $orders[$order_id]['products'][] = [
                'id' => $row['product_id'],
                'name' => $row['product_name'],
                'image' => 'images/' . $row['folder'] . '/' . $imageFile,
                'quantity' => $row['quantity']
            ];
        }
    }
    $orders = array_values($orders);
}

echo json_encode([
    'success' => true,
    'customer' => $customer,
    'orders' => $orders
]);

$conn->close();
?>
