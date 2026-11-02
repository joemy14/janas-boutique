<?php
require_once __DIR__ . '/auth_helper.php';
jb_cors();

ob_start();

// Handle CORS preflight

// Set headers
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
