<?php
require_once __DIR__.'/session.php';
require_once __DIR__.'/db.php';

function require_login() {
    if (!is_logged_in()) {
        header('Location: /auth/login.php');
        exit;
    }
}

function require_admin() {
    require_login();
    $user = current_user();
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        exit('Access denied');
    }
}

function current_user() {
    global $pdo;
    if (!is_logged_in()) return null;
    
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([get_user_id()]);
    return $stmt->fetch();
}
?>