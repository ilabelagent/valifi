<?php
require_once __DIR__.'/db.php';

function refresh_news() {
    global $pdo;
    
    // Get active news sources
    $sources = $pdo->query('SELECT * FROM news_sources WHERE is_active = 1')->fetchAll();
    
    foreach ($sources as $source) {
        if ($source['rss_url']) {
            fetch_rss_news($source);
        }
    }

    // After fetching new articles, perform housekeeping. Remove stale
    // records older than 30 days to keep the database lean. This helper is
    // defined below but previously unused. Triggering the cleanup here
    // ensures old articles are purged whenever the cron refresh runs.
    clean_old_news();
}

function fetch_rss_news($source) {
    global $pdo;
    
    try {
        $xml = @simplexml_load_file($source['rss_url']);
        if (!$xml) return;
        
        foreach ($xml->channel->item as $item) {
            $title = (string)$item->title;
            $link = (string)$item->link;
            $description = (string)$item->description;
            $pubDate = (string)$item->pubDate;
            
            // Create slug
            $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
            $slug = trim($slug, '-');
            
            // Check if article already exists
            $stmt = $pdo->prepare('SELECT id FROM news_articles WHERE url = ? OR slug = ?');
            $stmt->execute([$link, $slug]);
            if ($stmt->fetch()) continue;
            
            // Insert new article
            $stmt = $pdo->prepare('
                INSERT INTO news_articles (title, slug, summary, url, published_at, is_external, source_id, language, category, created_at) 
                VALUES (?, ?, ?, ?, ?, 1, ?, "en", "crypto", NOW())
            ');
            
            $publishedAt = $pubDate ? date('Y-m-d H:i:s', strtotime($pubDate)) : date('Y-m-d H:i:s');
            
            $stmt->execute([
                $title,
                $slug,
                strip_tags($description),
                $link,
                $publishedAt,
                $source['id']
            ]);
        }
    } catch (Exception $e) {
        error_log('RSS fetch error: ' . $e->getMessage());
    }
}

function clean_old_news() {
    global $pdo;
    // Delete articles older than 30 days
    $pdo->exec('DELETE FROM news_articles WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)');
}
?>