<?php
require_once __DIR__.'/includes/session.php';
require_once __DIR__.'/includes/db.php';
require_once __DIR__.'/includes/layout.php';

head('News - YourCryptoExchange.tech');

$st = $pdo->query('SELECT id,title,slug,summary,hero_image,language,category,published_at,is_external,url FROM news_articles ORDER BY published_at DESC, created_at DESC LIMIT 24');
$items = $st->fetchAll();
?>
<section class="mb-8">
  <h1 class="text-3xl font-bold mb-4">Latest Crypto News</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <?php foreach($items as $a): ?>
      <article class="bg-black/40 border border-green-500/20 rounded-xl p-5">
        <h2 class="text-xl font-semibold mb-2">
          <a class="hover:text-green-400" href="/article.php?slug=<?= urlencode($a['slug']) ?>"><?= htmlspecialchars($a['title']) ?></a>
        </h2>
        <p class="text-gray-300 text-sm line-clamp-3 mb-3"><?= htmlspecialchars($a['summary'] ?? '') ?></p>
        <div class="text-xs text-gray-400 flex items-center justify-between">
          <span><?= htmlspecialchars($a['language']) ?> · <?= htmlspecialchars($a['category'] ?? 'general') ?></span>
          <span><?= htmlspecialchars($a['published_at'] ?? '') ?></span>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
</section>

<section class="mt-10">
  <h3 class="text-xl font-semibold mb-3">Subscribe</h3>
  <form method="post" action="/subscribe.php" class="flex gap-2">
    <input type="email" name="email" required placeholder="Email address" class="px-3 py-2 rounded bg-gray-800 border border-gray-600 w-full max-w-md">
    <button class="px-4 py-2 rounded bg-green-600 hover:bg-green-700">Subscribe</button>
  </form>
</section>
<?php foot(); ?>