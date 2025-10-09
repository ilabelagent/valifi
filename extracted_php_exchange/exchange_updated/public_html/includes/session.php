<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function is_logged_in() {
    return isset($_SESSION['uid']) && $_SESSION['uid'] > 0;
}

function get_user_id() {
    return $_SESSION['uid'] ?? null;
}
?>