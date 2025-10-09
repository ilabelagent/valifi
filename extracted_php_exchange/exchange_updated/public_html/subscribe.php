<?php
require_once __DIR__.'/../includes/session.php';
require_once __DIR__.'/../includes/db.php';
$email = $_POST['email'] ?? '';
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) { header('Location: /index.php'); exit; }
$pdo->exec('CREATE TABLE IF NOT EXISTS newsletter (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(256) UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
$st=$pdo->prepare('INSERT IGNORE INTO newsletter(email) VALUES (?)');
$st->execute([$email]);
header('Location: /index.php');
