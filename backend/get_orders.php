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

$role = $user["role"];
if ($role === "customer") {
    $filterUserId = (int)$user["id"];
    $sql = "
        SELECT o.order_id, o.status, o.total_amount, o.created_at,
               u.email AS user_email, u.first_name, u.last_name, u.address, u.phone,
               (SELECT p.method FROM payments p WHERE p.order_id = o.order_id LIMIT 1) AS payment_method
          FROM orders o
          LEFT JOIN users u ON u.user_id = o.user_id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC
    ";
} elseif ($role === "admin" || $role === "staff") {
    if ($requestedUserId !== null) {
        $filterUserId = (int)$requestedUserId;
        $sql = "
            SELECT o.order_id, o.status, o.total_amount, o.created_at,
                   u.email AS user_email, u.first_name, u.last_name, u.address, u.phone,
                   (SELECT p.method FROM payments p WHERE p.order_id = o.order_id LIMIT 1) AS payment_method
              FROM orders o
              LEFT JOIN users u ON u.user_id = o.user_id
             WHERE o.user_id = ?
             ORDER BY o.created_at DESC
        ";
    } else {
        $sql = "
            SELECT o.order_id, o.status, o.total_amount, o.created_at,
                   u.email AS user_email, u.first_name, u.last_name, u.address, u.phone,
                   (SELECT p.method FROM payments p WHERE p.order_id = o.order_id LIMIT 1) AS payment_method
              FROM orders o
              LEFT JOIN users u ON u.user_id = o.user_id
             ORDER BY o.created_at DESC
        ";
    }
} else {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Forbidden"]);
    exit;
}

require_once __DIR__ . "/db.php";
$orderStmt = $conn->prepare($sql);
if (!$orderStmt) {
    echo json_encode(["orders" => [], "message" => $conn->error]);
    $conn->close();
    exit;
}
if (isset($filterUserId)) {
    $orderStmt->bind_param("i", $filterUserId);
}
if (!$orderStmt->execute()) {
    echo json_encode(["orders" => [], "message" => $orderStmt->error]);
    $orderStmt->close();
    $conn->close();
    exit;
}

$result = $orderStmt->get_result();
$itemStmt = $conn->prepare(
    "SELECT p.product_id AS id, p.name, p.image_path AS image, oi.quantity
       FROM order_items oi
       JOIN product_sizes ps ON ps.product_size_id = oi.product_size_id
       JOIN products p ON p.product_id = ps.product_id
      WHERE oi.order_id = ?"
);
if (!$itemStmt) {
    echo json_encode(["orders" => [], "message" => $conn->error]);
    $orderStmt->close();
    $conn->close();
    exit;
}

$orders = [];
while ($row = $result->fetch_assoc()) {
    $id = (int)$row["order_id"];
    $itemStmt->bind_param("i", $id);
    if (!$itemStmt->execute()) {
        echo json_encode(["orders" => [], "message" => $itemStmt->error]);
        $itemStmt->close();
        $orderStmt->close();
        $conn->close();
        exit;
    }

    $items = $itemStmt->get_result();
    $products = [];
    while ($item = $items->fetch_assoc()) {
        $item["id"] = (int)$item["id"];
        $item["quantity"] = (int)$item["quantity"];
        $products[] = $item;
    }

    $orders[] = [
        "id"             => $id,
        "user_email"     => $row["user_email"] ?? "Walk-in customer",
        "products"       => $products,
        "total_amount"   => (float)$row["total_amount"],
        "shipping_cost"  => 0,
        "payment_method" => $row["payment_method"] ?? "",
        "purchase_date"  => $row["created_at"],
        "first_name"     => $row["first_name"] ?? "",
        "last_name"      => $row["last_name"] ?? "",
        "address"        => $row["address"] ?? "",
        "city"           => "",
        "province"       => "",
        "zip"            => "",
        "phone"          => $row["phone"] ?? "",
        "status"         => $row["status"],
    ];
}

echo json_encode(["orders" => $orders]);
$itemStmt->close();
$orderStmt->close();
$conn->close();
?>
