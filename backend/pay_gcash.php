<?php
ob_start();

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(200);
    exit;
}

// Set headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

try {
    $input = file_get_contents("php://input");
    $data  = json_decode($input, true);

    $amount = 0;
    if ($data && isset($data['total'])) {
        $amount = floatval($data['total']);
    }

    ob_end_clean(); // clear any input
    echo json_encode([
        "status" => "success",
        "message" => "GCash payment processed (dummy response)",
        "amount" => $amount
    ]);
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage(),
        "amount" => 0
    ]);
}
