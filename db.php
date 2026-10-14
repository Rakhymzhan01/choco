<?php
// Saves the site's data in PostgreSQL. js/store.js sends and receives whole lists (users, deals, orders, ...),
// so this file turns each list into rows of the real tables in schema.sql, and rows back into lists.
set_exception_handler(function ($e) { error_log($e); http_response_code(500); });   // details go to the server log, not to the browser

$pdo = new PDO(getenv('CHOCO_DSN') ?: 'pgsql:host=localhost;dbname=choco', getenv('CHOCO_DB_USER') ?: null, getenv('CHOCO_DB_PASSWORD') ?: null,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);

/* ---------- small helpers (table and column names come from this file, values are always bound) ---------- */

// timestamp as text, in the same format as JavaScript's toISOString()
function iso(string $column): string {
    return "to_char($column AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"')";
}

function upsert(PDO $pdo, string $table, array $row): void {
    $cols = array_keys($row);
    $update = implode(', ', array_map(fn($c) => "$c = EXCLUDED.$c", array_diff($cols, ['id'])));
    $pdo->prepare("INSERT INTO $table (" . implode(', ', $cols) . ') VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ") ON CONFLICT (id) DO UPDATE SET $update")
        ->execute(array_values($row));
}

// the browser saves whole lists, so rows that are missing from the list were deleted
function keep_only(PDO $pdo, string $table, array $ids): void {
    $pdo->prepare("DELETE FROM $table WHERE NOT (id = ANY (CAST(? AS bigint[])))")->execute(['{' . implode(',', array_map('intval', $ids)) . '}']);
}

function pg_array(array $items): string {
    return '{' . implode(',', array_map(fn($s) => '"' . addcslashes((string) $s, '"\\') . '"', $items)) . '}';
}

// the browser picks the ids, so move the id counter past them (rows added by hand in a SQL client then still work)
function sync_ids(PDO $pdo, string $table): void {
    $pdo->query("SELECT setval(pg_get_serial_sequence('$table', 'id'), COALESCE(max(id), 1), max(id) IS NOT NULL) FROM $table");
}

/* ---------- users ---------- */

function load_users(PDO $pdo): array {
    return array_map(fn($u) => [
        'id' => (int) $u['id'], 'firstName' => $u['first_name'], 'lastName' => $u['last_name'], 'email' => $u['email'],
        'passwordHash' => $u['password_hash'], 'role' => $u['role'], 'phone' => $u['phone'], 'dob' => $u['dob'] ?? '',
        'photo' => $u['photo'], 'createdAt' => $u['created'],
    ], $pdo->query('SELECT *, ' . iso('created_at') . ' AS created FROM users ORDER BY id')->fetchAll());
}

function save_users(PDO $pdo, array $list): void {
    foreach ($list as $u) {
        upsert($pdo, 'users', ['id' => $u['id'], 'first_name' => $u['firstName'], 'last_name' => $u['lastName'], 'email' => $u['email'],
            'password_hash' => $u['passwordHash'], 'role' => $u['role'], 'phone' => $u['phone'] ?? '', 'dob' => ($u['dob'] ?? '') ?: null,
            'photo' => $u['photo'] ?? '', 'created_at' => $u['createdAt']]);
    }
    keep_only($pdo, 'users', array_column($list, 'id'));
    sync_ids($pdo, 'users');
}

/* ---------- deals ---------- */

function load_deals(PDO $pdo): array {
    return array_map(fn($d) => [
        'id' => (int) $d['id'], 'title' => $d['title'], 'merchant' => $d['merchant'], 'category' => $d['category_id'], 'district' => $d['district'],
        'oldPrice' => (int) $d['old_price'], 'price' => (int) $d['price'], 'rating' => (float) $d['rating'], 'reviews' => (int) $d['reviews'],
        'bought' => (int) $d['bought'], 'image' => $d['image'], 'validUntil' => $d['valid_until'], 'description' => $d['description'],
        'features' => json_decode($d['features_json']), 'conditions' => $d['conditions'],
    ], $pdo->query('SELECT *, array_to_json(features) AS features_json FROM deals ORDER BY id')->fetchAll());
}

function save_deals(PDO $pdo, array $list): void {
    foreach ($list as $d) {
        upsert($pdo, 'deals', ['id' => $d['id'], 'title' => $d['title'], 'merchant' => $d['merchant'], 'category_id' => $d['category'], 'district' => $d['district'],
            'old_price' => $d['oldPrice'], 'price' => $d['price'], 'rating' => $d['rating'], 'reviews' => $d['reviews'], 'bought' => $d['bought'],
            'image' => $d['image'], 'valid_until' => $d['validUntil'], 'description' => $d['description'], 'features' => pg_array($d['features']),
            'conditions' => $d['conditions']]);
    }
    keep_only($pdo, 'deals', array_column($list, 'id'));
    sync_ids($pdo, 'deals');
}

/* ---------- orders (each order carries its items) ---------- */

function load_orders(PDO $pdo): array {
    $items = [];
    foreach ($pdo->query('SELECT *, array_to_json(codes) AS codes_json FROM order_items ORDER BY id') as $i) {
        $items[$i['order_id']][] = ['dealId' => $i['deal_id'] === null ? null : (int) $i['deal_id'], 'title' => $i['title'], 'merchant' => $i['merchant'],
            'price' => (int) $i['price'], 'qty' => (int) $i['qty'], 'codes' => json_decode($i['codes_json'])];
    }
    return array_map(fn($o) => [
        'id' => (int) $o['id'], 'userId' => (int) $o['user_id'], 'status' => $o['status'], 'createdAt' => $o['created'], 'usageDate' => $o['usage_date'],
        'usageTime' => $o['time'], 'people' => (int) $o['people'], 'phone' => $o['phone'], 'comment' => $o['comment'], 'payment' => $o['payment'],
        'total' => (int) $o['total'], 'items' => $items[$o['id']] ?? [],
    ], $pdo->query("SELECT *, to_char(usage_time, 'HH24:MI') AS time, " . iso('created_at') . ' AS created FROM orders ORDER BY id')->fetchAll());
}

function save_orders(PDO $pdo, array $list): void {
    foreach ($list as $o) {
        upsert($pdo, 'orders', ['id' => $o['id'], 'user_id' => $o['userId'], 'status' => $o['status'], 'usage_date' => $o['usageDate'],
            'usage_time' => $o['usageTime'], 'people' => $o['people'], 'phone' => $o['phone'], 'comment' => $o['comment'] ?? '',
            'payment' => $o['payment'], 'total' => $o['total'], 'created_at' => $o['createdAt']]);
        $pdo->prepare('DELETE FROM order_items WHERE order_id = ?')->execute([$o['id']]);
        foreach ($o['items'] as $i) {
            $pdo->prepare('INSERT INTO order_items (order_id, deal_id, title, merchant, price, qty, codes) VALUES (?, ?, ?, ?, ?, ?, ?)')
                ->execute([$o['id'], $i['dealId'], $i['title'], $i['merchant'], $i['price'], $i['qty'], pg_array($i['codes'])]);
        }
    }
    keep_only($pdo, 'orders', array_column($list, 'id'));
}

/* ---------- contact messages ---------- */

function load_messages(PDO $pdo): array {
    return array_map(fn($m) => ['id' => (int) $m['id'], 'name' => $m['name'], 'email' => $m['email'], 'subject' => $m['subject'],
        'message' => $m['message'], 'createdAt' => $m['created']],
        $pdo->query('SELECT *, ' . iso('created_at') . ' AS created FROM messages ORDER BY id')->fetchAll());
}

function save_messages(PDO $pdo, array $list): void {
    foreach ($list as $m) {
        upsert($pdo, 'messages', ['id' => $m['id'], 'name' => $m['name'], 'email' => $m['email'], 'subject' => $m['subject'],
            'message' => $m['message'], 'created_at' => $m['createdAt']]);
    }
    keep_only($pdo, 'messages', array_column($list, 'id'));
    sync_ids($pdo, 'messages');
}

/* ---------- carts (one list per user: choco_cart_<user id>) ---------- */

function load_cart(PDO $pdo, int $userId): array {
    $st = $pdo->prepare('SELECT deal_id, qty FROM cart_items WHERE user_id = ? ORDER BY position');
    $st->execute([$userId]);
    return array_map(fn($r) => ['dealId' => (int) $r['deal_id'], 'qty' => (int) $r['qty']], $st->fetchAll());
}

function save_cart(PDO $pdo, int $userId, array $list): void {
    $pdo->prepare('DELETE FROM cart_items WHERE user_id = ?')->execute([$userId]);
    foreach (array_values($list) as $n => $item) {
        $pdo->prepare('INSERT INTO cart_items (user_id, deal_id, position, qty) VALUES (?, ?, ?, ?)')->execute([$userId, $item['dealId'], $n, $item['qty']]);
    }
}

/* ---------- request ---------- */

$method = $_SERVER['REQUEST_METHOD'];
$key = $_GET['key'] ?? '';
$lists = ['choco_users' => 'users', 'choco_deals' => 'deals', 'choco_orders' => 'orders', 'choco_messages' => 'messages'];
$cartOf = preg_match('/^choco_cart_(\d+)$/', $key, $m) ? (int) $m[1] : null;

if ($method === 'DELETE') {                       // Store.resetAll(): empty everything (the category and district lists stay)
    $pdo->exec('TRUNCATE order_items, orders, cart_items, messages, deals, users RESTART IDENTITY CASCADE');
    http_response_code(204);
} elseif (!isset($lists[$key]) && $cartOf === null && !in_array($key, ['choco_order_seq', 'choco_seeded_v1'], true)) {
    http_response_code(400);
} elseif ($method === 'GET') {
    if ($key === 'choco_seeded_v1') {
        $data = $pdo->query('SELECT EXISTS (SELECT 1 FROM users)')->fetchColumn() ? 1 : null;   // "already seeded" simply means there are users
    } elseif ($key === 'choco_order_seq') {
        $data = (int) $pdo->query("SELECT nextval(pg_get_serial_sequence('orders', 'id'))")->fetchColumn();   // reading it takes the next booking number
    } elseif ($cartOf !== null) {
        $data = load_cart($pdo, $cartOf);
    } else {
        $data = ('load_' . $lists[$key])($pdo);
    }
    if ($data === null) {
        http_response_code(204);                  // nothing saved yet
    } else {
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($key === 'choco_order_seq' || $key === 'choco_seeded_v1') {
        http_response_code(204);                  // both are worked out from the tables, nothing to store
    } elseif (!is_array($data)) {
        http_response_code(400);
    } else {
        $pdo->beginTransaction();                 // the whole list is saved, or none of it
        if ($cartOf !== null) {
            save_cart($pdo, $cartOf, $data);
        } else {
            ('save_' . $lists[$key])($pdo, $data);
        }
        $pdo->commit();
        http_response_code(204);
    }
} else {
    http_response_code(405);
}
