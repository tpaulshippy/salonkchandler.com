<?php
require_once '/var/www/wordpress/wp-load.php';

echo "=== All Registered Abilities ===\n";
foreach (wp_get_abilities() as $name => $ability) {
    $meta = $ability->get_meta();
    $public = $meta['mcp']['public'] ?? false;
    echo "  $name (public: " . ($public ? 'yes' : 'no') . ")\n";
}
