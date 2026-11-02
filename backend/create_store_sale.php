<?php
require_once __DIR__ . "/auth_helper.php";
jb_cors();

function store_sale_respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    store_sale_respond(405, ["success" => false, "message" => "Method not allowed"]);
}

$user = jb_require_role(["admin", "staff"]);
$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    store_sale_respond(400, ["success" => false, "message" => "Invalid JSON request."]);
}

$items = $data["items"] ?? null;
$paymentMethod = $data["paymentMethod"] ?? null;
if (!is_array($items) || count($items) === 0 || !in_array($paymentMethod, ["cash", "qr"], true)) {
    store_sale_respond(400, ["success" => false, "message" => "Invalid sale items or payment method."]);
}

$validatedItems = [];
$allowedSizes = ["S", "M", "L", "XL", "ONE"];
foreach ($items as $item) {
    if (!is_array($item)) {
        store_sale_respond(400, ["success" => false, "message" => "Invalid sale item."]);
    }

    $productId = filter_var($item["productId"] ?? null, FILTER_VALIDATE_INT);
    $quantity = filter_var($item["quantity"] ?? null, FILTER_VALIDATE_INT);
    $size = $item["size"] ?? null;
    if ($productId === false || $productId < 1 || $quantity === false || $quantity < 1 ||
        !is_string($size) || !in_array($size, $allowedSizes, true)) {
        store_sale_respond(400, ["success" => false, "message" => "Invalid sale item fields."]);
    }

    $validatedItems[] = [
        "productId" => (int)$productId,
        "quantity" => (int)$quantity,
        "size" => $size,
    ];
}

require_once __DIR__ . "/db.php";
if (!$conn->begin_transaction()) {
    store_sale_respond(500, ["success" => false, "message" => "Unable to create store sale."]);
}

try {
    $createdBy = (int)$user["id"];
    $createOrderStmt = $conn->prepare("CALL sp_create_order(NULL, 'store', ?, @new_id)");
    if (!$createOrderStmt) {
        throw new RuntimeException("Unable to prepare store order.");
    }
    $createOrderStmt->bind_param("i", $createdBy);
    if (!$createOrderStmt->execute()) {
        throw new RuntimeException("Unable to create store order.");
    }
    $createOrderStmt->close();

    $orderResult = $conn->query("SELECT @new_id AS order_id");
    if (!$orderResult) {
        throw new RuntimeException("Unable to read store order ID.");
    }
    $orderRow = $orderResult->fetch_assoc();
    $orderResult->free();
    $orderId = (int)($orderRow["order_id"] ?? 0);
    if ($orderId < 1) {
        throw new RuntimeException("Store order ID was not created.");
    }

    $findSizeStmt = $conn->prepare(
        "SELECT ps.product_size_id, p.price
           FROM product_sizes ps
           JOIN products p ON p.product_id = ps.product_id
          WHERE ps.product_id = ? AND ps.size = ? AND p.is_active = 1
            AND ps.stock_quantity >= ?
          LIMIT 1 FOR UPDATE"
    );
    $insertItemStmt = $conn->prepare(
        "INSERT INTO order_items (order_id, product_size_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)"
    );
    if (!$findSizeStmt || !$insertItemStmt) {
        throw new RuntimeException("Unable to prepare store sale items.");
    }

    foreach ($validatedItems as $item) {
        $findSizeStmt->bind_param("isi", $item["productId"], $item["size"], $item["quantity"]);
        if (!$findSizeStmt->execute()) {
            throw new RuntimeException("Unable to look up product size.");
        }
        $productSize = $findSizeStmt->get_result()->fetch_assoc();
        if (!$productSize) {
            throw new RuntimeException("Product is unavailable or has insufficient stock.");
        }

        $productSizeId = (int)$productSize["product_size_id"];
        $unitPrice = (float)$productSize["price"];
        $quantity = $item["quantity"];
        $insertItemStmt->bind_param("iiid", $orderId, $productSizeId, $quantity, $unitPrice);
        if (!$insertItemStmt->execute()) {
            throw new RuntimeException("Unable to insert store sale item.");
        }
    }
    $findSizeStmt->close();
    $insertItemStmt->close();

    $paymentStmt = $conn->prepare(
        "INSERT INTO payments (order_id, method, amount, status, paid_at)
         VALUES (@new_id, ?, fn_order_total(@new_id), 'confirmed', NOW())"
    );
    if (!$paymentStmt) {
        throw new RuntimeException("Unable to prepare store sale payment.");
    }
    $paymentStmt->bind_param("s", $paymentMethod);
    if (!$paymentStmt->execute()) {
        throw new RuntimeException("Unable to insert store sale payment.");
    }
    $paymentStmt->close();

    $updateOrderStmt = $conn->prepare("UPDATE orders SET status = 'paid' WHERE order_id = ?");
    if (!$updateOrderStmt) {
        throw new RuntimeException("Unable to prepare store order update.");
    }
    $updateOrderStmt->bind_param("i", $orderId);
    if (!$updateOrderStmt->execute()) {
        throw new RuntimeException("Unable to update store order.");
    }
    $updateOrderStmt->close();

    $totalStmt = $conn->prepare("SELECT fn_order_total(?) AS total");
    if (!$totalStmt) {
        throw new RuntimeException("Unable to prepare store sale total.");
    }
    $totalStmt->bind_param("i", $orderId);
    if (!$totalStmt->execute()) {
        throw new RuntimeException("Unable to calculate store sale total.");
    }
    $total = (float)$totalStmt->get_result()->fetch_assoc()["total"];
    $totalStmt->close();

    if (!$conn->commit()) {
        throw new RuntimeException("Unable to commit store sale.");
    }

    $conn->close();
    store_sale_respond(201, ["success" => true, "orderId" => $orderId, "total" => $total]);
} catch (Throwable $error) {
    $conn->rollback();
    $conn->close();
    store_sale_respond(500, ["success" => false, "message" => "Unable to create store sale."]);
}
?>
