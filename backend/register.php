<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$response = ["success" => false, "message" => "Unknown error"];

try {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data) {
        echo json_encode(["success" => false, "message" => "No data received"]);
        exit;
    }

    $firstName = $data['firstName'] ?? '';
    $lastName  = $data['lastName'] ?? '';
    $email     = $data['email'] ?? '';
    $password  = $data['password'] ?? '';

    // Connect to DB
    require_once __DIR__ . "/db.php";

    // Check for duplicate email
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already exists!"]);
        exit;
    }
    $stmt->close();

    // Insert new user
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, 'customer')");
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "SQL Error: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("ssss", $firstName, $lastName, $email, $hashedPassword);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Registration successful!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Insert Failed: " . $stmt->error]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
?>
