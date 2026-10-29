<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Connect to DB
$conn = new mysqli("localhost", "root", "", "cc105_boutique");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

// Get folder from query string (e.g., ?folder=tops)
$folder = isset($_GET['folder']) ? $_GET['folder'] : '';

// Base SQL: include is_deleted = 0 filter
$sql = "SELECT id, name, price, image_url, overview, features, stylingTip, folder, stock 
        FROM products 
        WHERE is_deleted = 0";

if (!empty($folder)) {
    // Use LIKE to include nested categories
    $search = "%$folder%";
    $stmt = $conn->prepare($sql . " AND folder LIKE ?");
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
        exit;
    }
    $stmt->bind_param("s", $search);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($sql);
    if (!$result) {
        echo json_encode(["success" => false, "message" => "Query failed: " . $conn->error]);
        exit;
    }
}

$products = [];
while ($row = $result->fetch_assoc()) {
    // If product is a perfume, decode features JSON to prices
    if (strtolower($row['folder']) === "perfumes" && !empty($row['features'])) {
        $row['prices'] = json_decode($row['features'], true); // convert features JSON to array
    }

    $products[] = $row;
}

echo json_encode(["success" => true, "products" => $products]);

$conn->close();
?>
