<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "cc105_boutique");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit();
}

$sql = "
SELECT 
    p.id AS order_id,
    p.user_email,
    p.total_amount,
    p.shipping_cost,
    p.payment_method,
    p.purchase_date,
    p.first_name,
    p.last_name,
    p.address,
    p.city,
    p.province,
    p.zip,
    p.phone,
    oi.product_id,
    pr.name AS product_name,
    pr.image_url AS product_image,
    pr.folder AS folder,
    oi.quantity
FROM purchases p
LEFT JOIN order_items oi ON p.id = oi.purchase_id
LEFT JOIN products pr ON oi.product_id = pr.id
ORDER BY p.purchase_date DESC
";

$result = $conn->query($sql);

$orders = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $order_id = $row['order_id'];

        // If this order_id is not yet in $orders, create it
        if (!isset($orders[$order_id])) {
            $orders[$order_id] = [
                'id' => $row['order_id'],
                'user_email' => $row['user_email'],
                'total_amount' => $row['total_amount'],
                'shipping_cost' => $row['shipping_cost'],
                'payment_method' => $row['payment_method'],
                'purchase_date' => $row['purchase_date'],
                'first_name' => $row['first_name'],
                'last_name' => $row['last_name'],
                'address' => $row['address'],
                'city' => $row['city'],
                'province' => $row['province'],
                'zip' => $row['zip'],
                'phone' => $row['phone'],
                'products' => []
            ];
        }

        // Add product to this order
        if ($row['product_id'] !== null) {
            // Use only the filename from product_image to avoid double "images/"
            $imageFile = basename($row['product_image']); // "top1.jpg"
            $orders[$order_id]['products'][] = [
                'id' => $row['product_id'],
                'name' => $row['product_name'],
                'image' => 'images/' . $row['folder'] . '/' . $imageFile, //
                'quantity' => $row['quantity']
            ];
        }
    }

    // Reset keys to have a normal numeric array
    $orders = array_values($orders);
}

echo json_encode(['orders' => $orders]);

$conn->close();
?>
