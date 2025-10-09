<?php
// Run this file once to populate sample news
require_once __DIR__.'/includes/db.php';

$sample_news = [
    [
        'title' => 'Bitcoin Reaches New All-Time High Above $100,000',
        'slug' => 'bitcoin-reaches-new-ath-100k',
        'summary' => 'Bitcoin has surged past the $100,000 milestone for the first time in history, driven by institutional adoption and growing mainstream acceptance.',
        'category' => 'bitcoin',
        'language' => 'en'
    ],
    [
        'title' => 'Ethereum 2.0 Staking Rewards Increase to 5.2%',
        'slug' => 'ethereum-staking-rewards-increase',
        'summary' => 'Ethereum validators are now earning higher rewards as network activity increases and more ETH is staked on the Beacon Chain.',
        'category' => 'ethereum', 
        'language' => 'en'
    ],
    [
        'title' => 'Major Bank Launches Crypto Trading Service',
        'slug' => 'major-bank-launches-crypto-trading',
        'summary' => 'One of the world\'s largest banks has announced the launch of cryptocurrency trading services for institutional clients.',
        'category' => 'institutional',
        'language' => 'en'
    ],
    [
        'title' => 'DeFi Protocol Launches Revolutionary Lending Platform',
        'slug' => 'defi-protocol-lending-platform',
        'summary' => 'A new decentralized finance protocol promises to revolutionize crypto lending with innovative collateral mechanisms.',
        'category' => 'defi',
        'language' => 'en'
    ],
    [
        'title' => 'Crypto Market Cap Surpasses $3 Trillion',
        'slug' => 'crypto-market-cap-3-trillion',
        'summary' => 'The total cryptocurrency market capitalization has reached a new milestone of $3 trillion, marking significant growth.',
        'category' => 'market',
        'language' => 'en'
    ]
];

foreach ($sample_news as $news) {
    $stmt = $pdo->prepare('
        INSERT IGNORE INTO news_articles (title, slug, summary, category, language, published_at, created_at, is_external) 
        VALUES (?, ?, ?, ?, ?, NOW(), NOW(), 0)
    ');
    
    $stmt->execute([
        $news['title'],
        $news['slug'], 
        $news['summary'],
        $news['category'],
        $news['language']
    ]);
}

echo "Sample news articles have been added to your database!";
echo "<br><a href='/index.php'>View your news site</a>";
?>