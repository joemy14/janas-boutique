<?php
require_once __DIR__ . '/auth_helper.php';
jb_cors();

header("Content-Type: application/json; charset=utf-8");

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    respond(400, ["success" => false, "message" => "Invalid JSON request."]);
}

$required = ["firstName", "lastName", "email", "address", "city", "province", "zip", "phone", "items", "total", "shippingCost", "paymentMethod"];
foreach ($required as $field) {
    if (!array_key_exists($field, $data)) {
        respond(400, ["success" => false, "message" => "Missing required field: {$field}."]);
    }
}

$paymentMethod = $data["paymentMethod"];
$cart = $data["items"];
$total = filter_var($data["total"], FILTER_VALIDATE_FLOAT);
$shippingCost = filter_var($data["shippingCost"], FILTER_VALIDATE_FLOAT);
if (!in_array($paymentMethod, ["qr", "cash"], true)) {
    respond(400, ["success" => false, "message" => "Unsupported payment method."]);
}
if (!is_array($cart) || count($cart) === 0 || $total === false || $total < 0 || $shippingCost === false || $shippingCost < 0) {
    respond(400, ["success" => false, "message" => "Invalid cart or order total."]);
}

$validatedCart = [];
foreach ($cart as $item) {
    if (!is_array($item)) {
        respond(400, ["success" => false, "message" => "Invalid cart item."]);
    }
    $id = filter_var($item["productId"] ?? null, FILTER_VALIDATE_INT);
    $quantity = filter_var($item["quantity"] ?? null, FILTER_VALIDATE_INT);
    if ($id === false || $id < 1 || $quantity === false || $quantity < 1) {
        respond(400, ["success" => false, "message" => "Invalid cart item fields."]);
    }
    $validatedCart[] = [
        "id" => $id,
        "quantity" => $quantity,
        "size" => isset($item["size"]) ? trim((string)$item["size"]) : "",
        "name" => isset($item["name"]) ? (string)$item["name"] : "",
        "image" => isset($item["image"]) ? (string)$item["image"] : "",
    ];
}

require_once __DIR__ . "/db.php";
$conn->begin_transaction();

try {
    $email = trim((string)$data["email"]);
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$user) {
        throw new RuntimeException("Customer account was not found.");
    }
    $userId = (int)$user["user_id"];

    $stmt = $conn->prepare("INSERT INTO orders (user_id, channel, status, total_amount) VALUES (?, 'online', 'pending', ?)");
    $stmt->bind_param("id", $userId, $total);
    $stmt->execute();
    $orderId = (int)$stmt->insert_id;
    $stmt->close();

    $findSize = $conn->prepare(
        "SELECT ps.product_size_id, p.name, p.image_path, p.price
           FROM product_sizes ps
           JOIN products p ON p.product_id = ps.product_id
          WHERE ps.product_id = ? AND p.is_active = 1" .
        " AND ps.stock_quantity >= ?" .
        " AND (? = '' OR ps.size = ?)" .
        " ORDER BY (ps.size = 'ONE') DESC, ps.size LIMIT 1 FOR UPDATE"
    );
    $insertItem = $conn->prepare(
        "INSERT INTO order_items (order_id, product_size_id, quantity, unit_price) VALUES (?, ?, ?, ?)"
    );
    $savedItems = [];

    foreach ($validatedCart as $item) {
        $findSize->bind_param("iiss", $item["id"], $item["quantity"], $item["size"], $item["size"]);
        $findSize->execute();
        $product = $findSize->get_result()->fetch_assoc();
        if (!$product) {
            throw new RuntimeException("Product is unavailable or has insufficient stock.");
        }

        $productSizeId = (int)$product["product_size_id"];
        $unitPrice = (float)$product["price"];
        $insertItem->bind_param("iiid", $orderId, $productSizeId, $item["quantity"], $unitPrice);
        $insertItem->execute();

        $savedItems[] = [
            "id" => $item["id"],
            "name" => (string)$product["name"],
            "image" => $product["image_path"],
            "quantity" => $item["quantity"],
            "price" => $unitPrice,
            "size" => $item["size"] ?: null,
        ];
    }
    $findSize->close();
    $insertItem->close();

    $stmt = $conn->prepare(
        "INSERT INTO payments (order_id, method, amount, status) VALUES (?, ?, fn_order_total(?), 'pending')"
    );
    $stmt->bind_param("isi", $orderId, $paymentMethod, $orderId);
    $stmt->execute();
    $stmt->close();

    $conn->commit();
    $conn->close();

    respond(201, [
        "success" => true,
        "order" => [
            "orderId" => "ORD-" . $orderId,
            "items" => $savedItems,
            "total" => (float)$total,
            "shippingCost" => (float)$shippingCost,
            "paymentMethod" => $paymentMethod,
            "firstName" => trim((string)$data["firstName"]),
            "lastName" => trim((string)$data["lastName"]),
            "address" => trim((string)$data["address"]),
            "city" => trim((string)$data["city"]),
            "province" => trim((string)$data["province"]),
            "zip" => trim((string)$data["zip"]),
            "phone" => trim((string)$data["phone"]),
        ],
        "receiptStatus" => "skipped",
    ]);
} catch (Throwable $error) {
    $conn->rollback();
    $conn->close();
    respond(400, ["success" => false, "message" => $error->getMessage()]);
}
