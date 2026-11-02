<?php
require_once __DIR__ . '/auth_helper.php';
jb_cors();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

try {
    require_once __DIR__ . "/db.php";
    if (!$conn) throw new Exception("Database connection failed");

    $data = json_decode(file_get_contents("php://input"), true);
    $email = trim($data['email'] ?? '');
    if (!$email) throw new Exception("Email is required");

    // Check if email exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) throw new Exception("Email not found");

    // Generate token
    $token = bin2hex(random_bytes(50));
    $expires = date("Y-m-d H:i:s", strtotime("+1 hour"));

    // Insert into password_resets
    $stmt = $conn->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $token, $expires);

    if (!$stmt->execute()) {
        echo json_encode([
            "success" => false,
            "message" => "Insert failed: " . $stmt->error
        ]);
        exit;
    }

    // Prepare reset link
    $resetLink = "http://localhost:3000/resetpassword?token=$token";

    // Send email
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = getenv('SMTP_HOST') ?: 'smtp-relay.brevo.com';
    $mail->SMTPAuth = true;
    $mail->Username = getenv('SMTP_USER');
    $mail->Password = getenv('SMTP_PASS');
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = getenv('SMTP_PORT') ?: 587;
    $mail->setFrom(getenv('SMTP_USER'), "Jana's Boutique");
    $mail->addAddress($email);
    $mail->isHTML(true);
    $mail->Subject = 'Password Reset Request';
    $mail->Body = "
        <p>Hello,</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href='$resetLink'>$resetLink</a></p>
        <p>This link will expire in 1 hour.</p>
    ";
    $mail->send();

    echo json_encode(["success" => true, "message" => "Reset link sent! Check your email."]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
