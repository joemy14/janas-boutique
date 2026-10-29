<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit();
}

$firstName = $data['firstName'] ?? '';
$lastName  = $data['lastName'] ?? '';
$email     = $data['email'] ?? '';
$address   = $data['address'] ?? '';
$city      = $data['city'] ?? '';
$province  = $data['state'] ?? '';
$zip       = $data['zipcode'] ?? '';
$phone     = $data['phone'] ?? '';
$cart      = $data['cart'] ?? [];
$total     = $data['total'] ?? 0;
$shipping  = $data['shippingCost'] ?? 0;
$paymentMethod = $data['paymentMethod'] ?? 'GCash';

if (!$firstName || !$lastName || !$email || !$address || !$city || !$province || !$zip || !$phone || empty($cart)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

$conn = new mysqli("localhost", "root", "", "cc105_boutique");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit();
}

$conn->begin_transaction();

try {
    // --- Check stock first ---
    foreach ($cart as $item) {
        $product_id = $item['id'] ?? 0;
        $quantity   = $item['quantity'] ?? 1;

        $stmt = $conn->prepare("SELECT stock FROM products WHERE id=? FOR UPDATE");
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        if (!$row) throw new Exception("Product ID {$product_id} not found");

        if ($quantity > intval($row['stock'])) {
            throw new Exception("Not enough stock for product ID {$product_id}. Available: {$row['stock']}");
        }
    }

    // --- Insert purchase ---
    $stmt = $conn->prepare("INSERT INTO purchases 
        (user_email, total_amount, shipping_cost, payment_method, purchase_date, first_name, last_name, address, city, province, zip, phone)
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sddssssssss", $email, $total, $shipping, $paymentMethod, $firstName, $lastName, $address, $city, $province, $zip, $phone);
    $stmt->execute();
    $purchase_id = $stmt->insert_id;
    $stmt->close();

    // --- Insert purchase items & update stock ---
    $stmtInsert = $conn->prepare("INSERT INTO purchase_items (purchase_id, product_id, name, image, quantity, price) VALUES (?, ?, ?, ?, ?, ?)");
    $stmtUpdateStock = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

    foreach ($cart as $item) {
        $product_id = $item['id'] ?? 0;
        $name       = $item['name'] ?? '';
        $image      = $item['image'] ?? '';
        $quantity   = $item['quantity'] ?? 1;
        $price      = $item['price'] ?? 0;

        $stmtInsert->bind_param("iissid", $purchase_id, $product_id, $name, $image, $quantity, $price);
        $stmtInsert->execute();

        $stmtUpdateStock->bind_param("ii", $quantity, $product_id);
        $stmtUpdateStock->execute();
    }

    $stmtInsert->close();
    $stmtUpdateStock->close();

    // --- Insert into order_items table ---
    $stmtOrder = $conn->prepare("INSERT INTO order_items (purchase_id, product_id, quantity) VALUES (?, ?, ?)");
    foreach ($cart as $item) {
        $product_id = $item['id'] ?? 0;
        $quantity   = $item['quantity'] ?? 1;
        $stmtOrder->bind_param("iii", $purchase_id, $product_id, $quantity);
        $stmtOrder->execute();
    }
    $stmtOrder->close();

    $conn->commit();
    ob_end_clean();

    // --- Generate orderId and billingId ---
    $orderId = "ORD-" . $purchase_id;
    $billingId = "BILL-" . rand(100000, 999999);

    // --- Send receipt email ---
    $receiptData = [
        "firstName" => $firstName,
        "lastName" => $lastName,
        "email" => $email,
        "address" => $address,
        "city" => $city,
        "state" => $province,
        "zipcode" => $zip,
        "phone" => $phone,
        "total" => $total,
        "shippingCost" => $shipping,
        "cart" => $cart,
        "orderId" => $orderId,
        "billingId" => $billingId
    ];

    $ch = curl_init("http://localhost/Backend/cc105backend/send_receipt.php");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($receiptData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $response = curl_exec($ch);
    curl_close($ch);

    $receiptResult = json_decode($response, true);

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Payment confirmed, order saved, and receipt sent',
        'order' => [
            'orderId' => $orderId,
            'billingId' => $billingId,
            'items' => $cart,
            'total' => $total,
            'shippingCost' => $shipping
        ],
        'receiptStatus' => $receiptResult['success'] ?? false
    ]);

} catch (Exception $e) {
    $conn->rollback();
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>
