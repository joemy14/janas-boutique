<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

require __DIR__ . '/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Receive order data
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['email'])) {
    echo json_encode(["success" => false, "message" => "Invalid or missing order data."]);
    exit;
}

$firstName = $data['firstName'] ?? '';
$lastName  = $data['lastName'] ?? '';
$name      = trim("$firstName $lastName");
$email     = $data['email'];
$orderId   = $data['orderId'] ?? '';
$billingId = $data['billingId'] ?? '';
$total     = $data['total'] ?? 0;
$shipping  = $data['shippingCost'] ?? 0;
$items     = $data['cart'] ?? [];

// Calculate grand total
$grandTotal = $total + $shipping;

// Generate items rows
$itemsHtml = "";
foreach ($items as $item) {
    $quantity = $item['quantity'] ?? 1;
    $price    = $item['price'] ?? 0;
    $itemsHtml .= "
    <tr>
        <td style='padding:6px; border-bottom:1px solid #ddd;'>{$item['name']} x{$quantity}</td>
        <td style='padding:6px; border-bottom:1px solid #ddd;'>₱" . number_format($price * $quantity, 2) . "</td>
    </tr>";
}

// Accent color
$accentColor = "#B29785";

// Email body (portrait-oriented, professional)
$body = "
<html>
  <body style='font-family: Arial, sans-serif; font-size:14px; line-height:1.6; background:#f5f5f5; margin:0; padding:20px;'>
    <div style='max-width:480px; margin:0 auto; background:#ffffff; border-radius: 0; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;'>

      <!-- HEADER WITH LOGO -->
    <div style='background:#585858ff; padding:25px 20px; text-align:center; color:#ffffff;'>
      <img src='https://i.ibb.co/GQv9501J/JANA-jpg.png' alt='Jana Logo' style='width:150px; max-width:80%; margin-bottom:10px;' />
      <p style='margin:10px 0 0; font-size:14px; color:#e0e0e0; letter-spacing:0.5px;'>Official Receipt</p>
    </div>


      <!-- BODY CONTENT -->
      <div style='padding:25px 20px; color:#333;'>

        <p style='font-size:15px;'>Hello <strong>$name</strong>,</p>
        <p style='margin-top:-5px;'>Thank you for shopping with us! Here is your official receipt:</p>

        <!-- ORDER INFO BOX -->
        <div style='background:#f7f3f0; padding:15px; border-left:4px solid #B29785; border-radius: 0; margin:15px 0;'>
          <p style='margin:5px 0;'><strong>Order ID:</strong> $orderId</p>
          <p style='margin:5px 0;'><strong>Billing ID:</strong> $billingId</p>
          <p style='margin:5px 0;'><strong>Shipping Cost:</strong> ₱" . number_format($shipping, 2) . "</p>
          <p style='margin:5px 0;'><strong>Total Amount:</strong> ₱" . number_format($grandTotal, 2) . "</p>
        </div>

        <!-- ORDER ITEMS -->
        <h3 style='margin-top:20px; font-size:18px; color:#5a4b42;'>Order Summary</h3>
        <table style='width:100%; border-collapse:collapse; margin-top:10px;'>
          <tr style='background:#e6e1dd;'>
            <th style='padding:10px; text-align:left; font-size:14px;'>Item</th>
            <th style='padding:10px; text-align:right; font-size:14px;'>Price</th>
          </tr>
          $itemsHtml
        </table>

        <p style='margin-top:20px; font-size:14px;'>
          If you have any questions, feel free to reply to this email. We're always here to help!
        </p>

        <div style='margin-top:30px; text-align:center; font-size:12px; color:#888; padding-top:15px; border-top:1px solid #ddd;'>
          © " . date("Y") . " Jana's Boutique — All Rights Reserved.
        </div>

      </div>
    </div>
  </body>
</html>
";


// Send email
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPAuth = true;
    $mail->Username = "jana.workplace.ph@gmail.com";  
    $mail->Password = "lfbjtuowolvcwidj"; // Gmail App Password
    $mail->SMTPSecure = "tls";
    $mail->Port = 587;

    $mail->setFrom("jana.workplace.ph@gmail.com", "Jana's Boutique");
    $mail->addAddress($email, $name);
    $mail->isHTML(true);
    $mail->Subject = "Your Receipt - Order #$orderId";
    $mail->Body = $body;

    $mail->send();
    echo json_encode(["success" => true, "message" => "Receipt sent successfully."]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Failed to send email. Error: " . $mail->ErrorInfo]);
}
?>
