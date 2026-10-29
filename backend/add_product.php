<?php
// 🚨 FIRST LINE: no empty lines before this
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Base URL of your backend (adjust if needed)
$backendURL = "http://127.0.0.1/Backend/CC105Backend/";

// Connect to DB
$conn = new mysqli("localhost", "root", "", "cc105_boutique");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed: " . $conn->connect_error]);
    exit;
}

// Debug: show which DB we are connected to
$dbName = $conn->query("SELECT DATABASE()")->fetch_row()[0];

// Get POST data
$name = trim($_POST['name'] ?? '');
$description = trim($_POST['description'] ?? '');
$price = floatval($_POST['price'] ?? 0);
$stock = intval($_POST['stock'] ?? 0);
$folder = trim($_POST['folder'] ?? 'misc');
$image = $_FILES['image'] ?? null;
$features = trim($_POST['features'] ?? '');
$stylingTip = trim($_POST['stylingTip'] ?? '');

// Validate required fields
if (empty($name) || empty($description) || $price <= 0 || $stock < 0 || !$image) {
    echo json_encode([
        "success" => false,
        "message" => "All required fields must be filled and valid",
        "debug" => [
            "name" => $name,
            "description" => $description,
            "price" => $price,
            "stock" => $stock,
            "image_uploaded" => $image ? true : false
        ]
    ]);
    exit;
}

// Handle nested folders (e.g., "Shoes > Sandals")
$folderParts = explode(' > ', $folder);
$folderParts = array_map(function($part) { return strtolower(trim($part)); }, $folderParts);
$targetDir = __DIR__ . "/images/" . implode('/', $folderParts) . '/';

// Create folder if it doesn't exist
if (!is_dir($targetDir) && !mkdir($targetDir, 0777, true)) {
    echo json_encode(["success" => false, "message" => "Failed to create target directory", "debug" => $targetDir]);
    exit;
}

// Sanitize filename
$filename = basename($image['name']);
$filename = preg_replace("/[^a-zA-Z0-9._-]/", "_", $filename);
$targetFile = $targetDir . $filename;

// Upload image
if (!move_uploaded_file($image['tmp_name'], $targetFile)) {
    echo json_encode(["success" => false, "message" => "Image upload failed", "debug" => $targetFile]);
    exit;
}

// Full URL for frontend to load image
$imageURL = $backendURL . "images/" . implode('/', $folderParts) . "/$filename";
$folderDB = implode('/', $folderParts); // store folder path like 'shoes/sandals'

// Prepare INSERT query
$stmt = $conn->prepare("
    INSERT INTO products (name, price, image_url, overview, features, stylingTip, folder, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
    exit;
}

// Bind parameters
$stmt->bind_param(
    "sdsssssi",
    $name,
    $price,
    $imageURL,
    $description,
    $features,
    $stylingTip,
    $folderDB,
    $stock
);

// Execute and debug
if ($stmt->execute()) {
    $lastId = $stmt->insert_id;
    echo json_encode([
        "success" => true,
        "message" => "Product added successfully",
        "database" => $dbName,
        "debug" => [
            "inserted_id" => $lastId,
            "imageURL" => $imageURL,
            "price" => $price,
            "stock" => $stock,
            "folder" => $folderDB,
            "filename" => $filename,
            "targetDir" => $targetDir,
            "targetFile_exists" => file_exists($targetFile)
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "DB insert failed",
        "error" => $stmt->error,
        "debug" => [
            "imageURL" => $imageURL,
            "price" => $price,
            "stock" => $stock,
            "folder" => $folderDB
        ]
    ]);
}

$conn->close();
?>
