<?php
require_once __DIR__.'/../includes/session.php';
require_once __DIR__.'/../includes/db.php';
require_once __DIR__.'/../includes/layout.php';
require_once __DIR__.'/../includes/auth.php';
require_once __DIR__.'/../includes/csrf.php';
require_once __DIR__.'/../includes/news_fetch.php';

require_admin();

$msg='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
  csrf_verify();
  if (isset($_POST['add_source'])) {
    $name = trim($_POST['name']??''); 
    $url = trim($_POST['url']??''); 
    $rss = trim($_POST['rss_url']??'');
    if ($name && $url) {
      $st=$pdo->prepare('INSERT INTO news_sources(name,slug,url,rss_url,is_active) VALUES (?,?,?,?,1)');
      $slug = strtolower(preg_replace('/[^a-z0-9]+/i','-',$name));
      $st->execute([$name,$slug,$url,$rss?:null]);
      $msg='Source added.';
    }
  } elseif (isset($_POST['refresh_now'])) {
    refresh_news(); 
    $msg='News refreshed.';
  }
}

$src = $pdo->query('SELECT id,name,url,rss_url,is_active FROM news_sources ORDER BY id DESC')->fetchAll();

head('Admin - News');
?>
<h1 class="text-2xl font-bold mb-4">Admin - News</h1>
<?php if($msg): ?><div class="text-green-400 mb-3"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

<section class="mb-8">
  <h2 class="text-xl font-semibold mb-2">Add Source</h2>
  <form method="post" class="space-y-2 bg-black/40 border border-green-500/20 rounded-xl p-4">
    <?php csrf_field(); ?>
    <input name="name" placeholder="Name" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600">
    <input name="url" placeholder="Site URL" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600">
    <input name="rss_url" placeholder="RSS URL (optional)" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600">
    <button name="add_source" class="px-4 py-2 rounded bg-green-600 hover:bg-green-700">Add Source</button>
    <button name="refresh_now" class="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700">Refresh Now</button>
  </form>
</section>

<section>
  <h2 class="text-xl font-semibold mb-2">Sources</h2>
  <div class="space-y-2">
    <?php foreach($src as $s): ?>
      <div class="bg-black/40 border border-green-500/20 rounded-xl p-3 text-sm">
        <strong><?= htmlspecialchars($s['name']) ?></strong> - <?= htmlspecialchars($s['url']) ?> 
        <?= $s['rss_url']? ' | RSS: '.htmlspecialchars($s['rss_url']) : '' ?>
      </div>
    <?php endforeach; ?>
  </div>
</section>
<?php foot(); ?>