<?php
require_once __DIR__ . "/auth_helper.php";
jb_cors();

$user = jb_require_user();

$requestedUserId = null;
if (array_key_exists("user_id", $_GET)) {
    $requestedUserId = filter_var($_GET["user_id"], FILTER_VALIDATE_INT);
    if ($requestedUserId === false || $requestedUserId < 1) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid user_id"]);
        exit;
    }
}

$sql = "
    SELECT o.order_id AS id,
           CONCAT('ORD-', o.order_id) AS orderNumber,
           COALESCE(u.email, '') AS email,
           COALESCE(u.first_name, '') AS firstName,
           COALESCE(u.last_name, '') AS lastName,
           COALESCE(u.address, '') AS address,
           '' AS city,
           '' AS province,
           '' AS zip,
           COALESCE(u.phone, '') AS phone,
           COALESCE((SELECT p.method FROM payments p WHERE p.order_id = o.order_id LIMIT 1), '') AS paymentMethod,
           0.00 AS shippingCost,
           o.total_amount AS totalAmount,
           o.created_at AS createdAt,
           o.status AS status
      FROM orders o
      LEFT JOIN users u ON u.user_id = o.user_id
";

$filterUserId = null;
if ($user["role"] === "customer") {
    $filterUserId = (int)$user["id"];
    $sql .= " WHERE o.user_id = ?";
} elseif ($user["role"] === "admin" || $user["role"] === "staff") {
    if ($requestedUserId !== null) {
        $filterUserId = (int)$requestedUserId;
        $sql .= " WHERE o.user_id = ?";
    }
} else {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Forbidden"]);
    exit;
}
$sql .= " ORDER BY o.created_at DESC";

require_once __DIR__ . "/db.php";
$orderStmt = $conn->prepare($sql);
if (!$orderStmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to fetch orders."]);
    $conn->close();
    exit;
}
if ($filterUserId !== null) {
    $orderStmt->bind_param("i", $filterUserId);
}
if (!$orderStmt->execute()) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to fetch orders."]);
    $orderStmt->close();
    $conn->close();
    exit;
}

$result = $orderStmt->get_result();
$itemStmt = $conn->prepare(
    "SELECT oi.order_item_id AS id, ps.product_id AS productId,
            p.name, p.image_path AS imageUrl, ps.size, oi.quantity,
            oi.unit_price AS unitPrice
       FROM order_items oi
       JOIN product_sizes ps ON ps.product_size_id = oi.product_size_id
       JOIN products p ON p.product_id = ps.product_id
      WHERE oi.order_id = ?"
);
if (!$itemStmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to fetch order items."]);
    $orderStmt->close();
    $conn->close();
    exit;
}

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orderId = (int)$row["id"];
    $itemStmt->bind_param("i", $orderId);
    if (!$itemStmt->execute()) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Unable to fetch order items."]);
        $itemStmt->close();
        $orderStmt->close();
        $conn->close();
        exit;
    }

    $itemsResult = $itemStmt->get_result();
    $items = [];
    while ($item = $itemsResult->fetch_assoc()) {
        $item["id"] = (int)$item["id"];
        $item["productId"] = (int)$item["productId"];
        $item["quantity"] = (int)$item["quantity"];
        $item["unitPrice"] = (float)$item["unitPrice"];
        $items[] = $item;
    }

    $row["id"] = $orderId;
    $row["shippingCost"] = (float)$row["shippingCost"];
    $row["totalAmount"] = (float)$row["totalAmount"];
    $row["items"] = $items;
    $orders[] = $row;
}

echo json_encode(["success" => true, "orders" => $orders]);
$itemStmt->close();
$orderStmt->close();
$conn->close();
?>
