<?php
require_once __DIR__.'/includes/session.php';
require_once __DIR__.'/includes/db.php';
require_once __DIR__.'/includes/layout.php';

$id = (int)($_GET['id'] ?? 0);
$slug = $_GET['slug'] ?? '';

if ($id) { 
    $st = $pdo->prepare('SELECT * FROM news_articles WHERE id=?'); 
    $st->execute([$id]); 
} else if ($slug) { 
    $st = $pdo->prepare('SELECT * FROM news_articles WHERE slug=?'); 
    $st->execute([$slug]); 
} else { 
    http_response_code(404); 
    exit('Not found'); 
}

$article = $st->fetch();
if (!$article) { 
    http_response_code(404); 
    exit('Not found'); 
}

$pdo->prepare('INSERT INTO news_views(article_id,user_id,ip) VALUES (?,?,?)')
    ->execute([$article['id'], $_SESSION['uid'] ?? null, $_SERVER['REMOTE_ADDR'] ?? null]);

head(htmlspecialchars($article['title']).' - News');
?>
<article class="prose prose-invert max-w-none">
  <h1 class="text-3xl font-bold mb-4"><?= htmlspecialchars($article['title']) ?></h1>
  <?php if($article['is_external']): ?>
    <p class="text-sm text-gray-400 mb-2">External source - <a class="text-green-400" href="<?= htmlspecialchars($article['url']) ?>" target="_blank" rel="noopener">Open original</a></p>
  <?php endif; ?>
  <?php if($article['body']): ?>
    <div class="mb-6 whitespace-pre-wrap"><?= nl2br(htmlspecialchars($article['body'])) ?></div>
  <?php else: ?>
    <p class="text-gray-200 mb-6"><?= htmlspecialchars($article['summary'] ?? '') ?></p>
  <?php endif; ?>
</article>
<a href="/index.php" class="inline-block mt-6 text-green-400 hover:text-green-300">&larr; Back to news</a>
<?php foot(); ?>