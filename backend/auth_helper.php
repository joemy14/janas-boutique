<?php
header("Content-Type: application/json; charset=utf-8");

$envPath = __DIR__ . "/.env";
if (is_file($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === "" || $line[0] === "#") {
            continue;
        }
        if (!preg_match('/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/', $line, $matches)) {
            continue;
        }

        $name = $matches[1];
        $value = trim($matches[2]);
        if (strlen($value) >= 2) {
            $first = $value[0];
            $last = $value[strlen($value) - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }
        putenv($name . "=" . $value);
    }
}

$sessionSecret = getenv("SESSION_SECRET");
if ($sessionSecret === false || strlen($sessionSecret) < 32) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server misconfigured"]);
    exit;
}

function jb_b64url_decode(string $s): string
{
    $base64 = strtr($s, "-_", "+/");
    $base64 .= str_repeat("=", (4 - (strlen($base64) % 4)) % 4);
    $decoded = base64_decode($base64, true);
    return $decoded === false ? "" : $decoded;
}

function jb_b64url_encode(string $s): string
{
    return rtrim(strtr(base64_encode($s), "+/", "-_"), "=");
}

function jb_current_user(): ?array
{
    global $sessionSecret;

    $raw = $_COOKIE["jb_session"] ?? null;
    if (!is_string($raw)) {
        return null;
    }

    $parts = explode(".", $raw);
    if (count($parts) !== 2) {
        return null;
    }
    [$payloadB64, $sigB64] = $parts;

    $expected = jb_b64url_encode(hash_hmac("sha256", $payloadB64, $sessionSecret, true));
    if (!hash_equals($expected, $sigB64)) {
        return null;
    }

    $json = jb_b64url_decode($payloadB64);
    $data = json_decode($json, true);
    if (!is_array($data)) {
        return null;
    }
    if (!isset($data["exp"]) || !is_int($data["exp"]) || $data["exp"] < time() * 1000) {
        return null;
    }
    if (!isset($data["id"], $data["role"])) {
        return null;
    }

    return $data;
}

function jb_require_user(): array
{
    $user = jb_current_user();
    if ($user === null) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }
    return $user;
}

function jb_require_role(array $roles): array
{
    $user = jb_require_user();
    if (!in_array($user["role"], $roles, true)) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Forbidden"]);
        exit;
    }
    return $user;
}

function jb_cors(): void
{
    $configuredOrigin = getenv("ALLOWED_ORIGIN");
    $requestOrigin = $_SERVER["HTTP_ORIGIN"] ?? "";

    if ($configuredOrigin !== false && trim($configuredOrigin) !== "") {
        $configuredOrigin = trim($configuredOrigin);
        if ($requestOrigin === "" || hash_equals($configuredOrigin, $requestOrigin)) {
            header("Access-Control-Allow-Origin: " . $configuredOrigin);
        }
    } elseif ($requestOrigin !== "") {
        $requestHost = strtolower((string)parse_url($requestOrigin, PHP_URL_HOST));
        if (in_array($requestHost, ["localhost", "127.0.0.1", "::1"], true)) {
            header("Access-Control-Allow-Origin: " . $requestOrigin);
        }
    } elseif (in_array($_SERVER["REMOTE_ADDR"] ?? "", ["127.0.0.1", "::1"], true)) {
        header("Access-Control-Allow-Origin: *");
    }
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Cookie");
    header("Content-Type: application/json; charset=utf-8");
    if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
        http_response_code(200);
        exit;
    }
}
