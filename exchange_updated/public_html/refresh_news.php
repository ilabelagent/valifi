<?php
require_once __DIR__.'/../includes/news_fetch.php';
require_once __DIR__.'/../includes/db.php';
$config = require __DIR__.'/../includes/config.php';
$token = $_GET['token'] ?? '';
if (!$token || !hash_equals($config['CRON_TOKEN'], $token)) { http_response_code(403); exit('Forbidden'); }
refresh_news();
echo 'OK';
?>