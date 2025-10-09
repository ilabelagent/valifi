YourCryptoExchange.tech — News‑First + Exchange (Monolithic PHP)
=================================================================
Deploy:
1) Copy includes/config.sample.php to includes/config.php and fill credentials.
2) Import sql/prod_with_news.sql.
3) Upload 'public/' to public_html/, 'includes/' to public_html/includes/.
4) Set a cron to call /refresh_news.php?token=YOUR_CRON_TOKEN
