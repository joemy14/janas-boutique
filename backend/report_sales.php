<?php
require_once __DIR__ . '/auth_helper.php';
require_once __DIR__ . '/db.php';

jb_cors();
jb_require_role(['admin', 'staff']);

function valid_report_date($value): bool
{
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return false;
    }
    $date = DateTime::createFromFormat('!Y-m-d', $value);
    return $date !== false && $date->format('Y-m-d') === $value;
}

$from = $_GET['from'] ?? '';
$to = $_GET['to'] ?? '';
if (!is_string($from) || !is_string($to) || ($from !== '' && !valid_report_date($from)) || ($to !== '' && !valid_report_date($to))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dates must use YYYY-MM-DD format']);
    exit;
}

$sql = "SELECT DATE(created_at) AS date,
               COUNT(order_id) AS orders,
               SUM(fn_order_total(order_id)) AS revenue
          FROM orders
         WHERE status IN ('paid', 'completed')
           AND (created_at >= ? OR ? = '')
           AND (created_at <= CONCAT(?, ' 23:59:59') OR ? = '')
         GROUP BY DATE(created_at)
         ORDER BY date DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to prepare sales report']);
    exit;
}

$stmt->bind_param('ssss', $from, $from, $to, $to);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to load sales report']);
    $stmt->close();
    $conn->close();
    exit;
}

$result = $stmt->get_result();
$sales = [];
while ($row = $result->fetch_assoc()) {
    $sales[] = $row;
}

echo json_encode(['success' => true, 'sales' => $sales]);
$result->free();
$stmt->close();
$conn->close();
?>
