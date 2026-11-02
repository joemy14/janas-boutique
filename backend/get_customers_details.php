<?php
require_once __DIR__ . "/auth_helper.php";
jb_cors();
jb_require_role(["admin", "staff"]);

require_once __DIR__ . "/db.php";

if (array_key_exists("id", $_GET)) {
    $customerId = filter_var($_GET["id"], FILTER_VALIDATE_INT);
    if ($customerId === false || $customerId < 1) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid customer id."]);
        $conn->close();
        exit;
    }

    $customerStmt = $conn->prepare(
        "SELECT user_id AS id, first_name AS firstName, last_name AS lastName, email
           FROM users
          WHERE user_id = ? AND role = 'customer'
          LIMIT 1"
    );
    if (!$customerStmt) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to fetch customer."]);
        $conn->close();
        exit;
    }
    $customerStmt->bind_param("i", $customerId);
    if (!$customerStmt->execute()) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to fetch customer."]);
        $customerStmt->close();
        $conn->close();
        exit;
    }
    $customer = $customerStmt->get_result()->fetch_assoc();
    $customerStmt->close();

    if (!$customer) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Customer not found."]);
        $conn->close();
        exit;
    }
    $customer["id"] = (int)$customer["id"];

    $ordersStmt = $conn->prepare(
        "SELECT o.order_id AS id, CONCAT('ORD-', o.order_id) AS orderNumber,
                u.email, u.first_name AS firstName, u.last_name AS lastName,
                COALESCE(u.address, '') AS address, '' AS city, '' AS province, '' AS zip,
                COALESCE(u.phone, '') AS phone,
                (SELECT p.method FROM payments p WHERE p.order_id = o.order_id LIMIT 1) AS paymentMethod,
                0 AS shippingCost, o.total_amount AS totalAmount, o.created_at AS createdAt
           FROM orders o
           JOIN users u ON u.user_id = o.user_id
          WHERE o.user_id = ?
          ORDER BY o.created_at DESC"
    );
    if (!$ordersStmt) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to fetch customer orders."]);
        $conn->close();
        exit;
    }
    $ordersStmt->bind_param("i", $customerId);
    if (!$ordersStmt->execute()) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to fetch customer orders."]);
        $ordersStmt->close();
        $conn->close();
        exit;
    }

    $ordersResult = $ordersStmt->get_result();
    $orders = [];
    $orderIds = [];
    while ($row = $ordersResult->fetch_assoc()) {
        $row["id"] = (int)$row["id"];
        $row["shippingCost"] = (float)$row["shippingCost"];
        $row["totalAmount"] = (float)$row["totalAmount"];
        $row["items"] = [];
        $orderIds[] = $row["id"];
        $orders[$row["id"]] = $row;
    }
    $ordersStmt->close();

    if (count($orderIds) > 0) {
        $itemsStmt = $conn->prepare(
            "SELECT oi.order_id, oi.order_item_id AS id, p.product_id AS productId,
                    p.name, p.image_path AS imageUrl, ps.size, oi.quantity,
                    oi.unit_price AS unitPrice
               FROM order_items oi
               JOIN product_sizes ps ON ps.product_size_id = oi.product_size_id
               JOIN products p ON p.product_id = ps.product_id
               JOIN orders o ON o.order_id = oi.order_id
              WHERE o.user_id = ?
              ORDER BY oi.order_id DESC, oi.order_item_id ASC"
        );
        if (!$itemsStmt) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to fetch customer order items."]);
            $conn->close();
            exit;
        }
        $itemsStmt->bind_param("i", $customerId);
        if (!$itemsStmt->execute()) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to fetch customer order items."]);
            $itemsStmt->close();
            $conn->close();
            exit;
        }

        $itemsResult = $itemsStmt->get_result();
        while ($item = $itemsResult->fetch_assoc()) {
            $orderId = (int)$item["order_id"];
            unset($item["order_id"]);
            $item["id"] = (int)$item["id"];
            $item["productId"] = (int)$item["productId"];
            $item["quantity"] = (int)$item["quantity"];
            $item["unitPrice"] = (float)$item["unitPrice"];
            $orders[$orderId]["items"][] = $item;
        }
        $itemsStmt->close();
    }

    echo json_encode(["success" => true, "customer" => $customer, "orders" => array_values($orders)]);
    $conn->close();
    exit;
}

$customersStmt = $conn->prepare(
    "SELECT user_id AS id, first_name AS firstName, last_name AS lastName, email
       FROM users
      WHERE role = 'customer'
      ORDER BY user_id DESC"
);
if (!$customersStmt || !$customersStmt->execute()) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to fetch customers."]);
    if ($customersStmt) {
        $customersStmt->close();
    }
    $conn->close();
    exit;
}

$customers = [];
$customersResult = $customersStmt->get_result();
while ($row = $customersResult->fetch_assoc()) {
    $row["id"] = (int)$row["id"];
    $customers[] = $row;
}

echo json_encode(["success" => true, "customers" => $customers]);
$customersStmt->close();
$conn->close();
?>
