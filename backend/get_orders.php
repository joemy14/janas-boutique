<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/db.php";

$sql = "
    SELECT o.order_id, o.status, o.total_amount, o.created_at,
           u.email AS user_email, u.first_name, u.last_name, u.address, u.phone,
           (SELECT p.method FROM payments p WHERE p.order_id = o.order_id LIMIT 1) AS payment_method
      FROM orders o
      LEFT JOIN users u ON u.user_id = o.user_id
     ORDER BY o.created_at DESC
";

$result = $conn->query($sql);
if (!$result) {
    echo json_encode(["orders" => [], "message" => $conn->error]);
    exit;
}

$orders = [];
while ($row = $result->fetch_assoc()) {
    $id = (int)$row['order_id'];

    $products = [];
    $itemsSql = "
        SELECT p.product_id AS id, p.name, p.image_path AS image, oi.quantity
          FROM order_items oi
          JOIN product_sizes ps ON ps.product_size_id = oi.product_size_id
          JOIN products p ON p.product_id = ps.product_id
         WHERE oi.order_id = $id
    ";
    $items = $conn->query($itemsSql);
    while ($item = $items->fetch_assoc()) {
        $item['id'] = (int)$item['id'];
        $item['quantity'] = (int)$item['quantity'];
        $products[] = $item;
    }

    $orders[] = [
        "id"             => $id,
        "user_email"     => $row['user_email'] ?? "Walk-in customer",
        "products"       => $products,
        "total_amount"   => (float)$row['total_amount'],
        "shipping_cost"  => 0,
        "payment_method" => $row['payment_method'] ?? "",
        "purchase_date"  => $row['created_at'],
        "first_name"     => $row['first_name'] ?? "",
        "last_name"      => $row['last_name'] ?? "",
        "address"        => $row['address'] ?? "",
        "city"           => "",
        "province"       => "",
        "zip"            => "",
        "phone"          => $row['phone'] ?? "",
        "status"         => $row['status'],
    ];
}

echo json_encode(["orders" => $orders]);
$conn->close();
?>