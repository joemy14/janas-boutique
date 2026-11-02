<?php
require_once __DIR__ . "/auth_helper.php";
jb_cors();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

jb_require_role(["admin", "staff"]);

$data = json_decode(file_get_contents("php://input"), true);
$orderId = is_array($data) ? filter_var($data["orderId"] ?? null, FILTER_VALIDATE_INT) : false;
if ($orderId === false || $orderId < 1) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid orderId."]);
    exit;
}

require_once __DIR__ . "/db.php";
if (!$conn->begin_transaction()) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to confirm payment."]);
    $conn->close();
    exit;
}

$paymentStmt = $conn->prepare(
    "UPDATE payments SET status = 'confirmed', paid_at = NOW()
      WHERE order_id = ? AND status = 'pending'"
);
if (!$paymentStmt) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to confirm payment."]);
    $conn->close();
    exit;
}

$paymentStmt->bind_param("i", $orderId);
if (!$paymentStmt->execute()) {
    $paymentStmt->close();
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to confirm payment."]);
    $conn->close();
    exit;
}

if ($paymentStmt->affected_rows === 0) {
    $paymentStmt->close();
    $conn->rollback();
    http_response_code(409);
    echo json_encode(["success" => false, "message" => "Payment not found or already confirmed."]);
    $conn->close();
    exit;
}
if ($paymentStmt->affected_rows !== 1) {
    $paymentStmt->close();
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to confirm payment."]);
    $conn->close();
    exit;
}
$paymentStmt->close();

$orderStmt = $conn->prepare(
    "UPDATE orders SET status = 'paid' WHERE order_id = ? AND status = 'pending'"
);
if (!$orderStmt) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to confirm payment."]);
    $conn->close();
    exit;
}

$orderStmt->bind_param("i", $orderId);
if (!$orderStmt->execute() || !$conn->commit()) {
    $orderStmt->close();
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to confirm payment."]);
    $conn->close();
    exit;
}

$orderStmt->close();
$conn->close();
http_response_code(200);
echo json_encode(["success" => true]);
?>
