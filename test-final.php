<?php
require_once '/var/www/wordpress/wp-load.php';

echo "=== Testing Abilities Flow ===\n\n";

// Check abilities before
$before = wp_get_abilities();
echo "Abilities before hook: " . count($before) . "\n";

// Run the hook
echo "Running wp_abilities_api_init...\n";
do_action('wp_abilities_api_init');

// Check abilities after
$after = wp_get_abilities();
echo "Abilities after hook: " . count($after) . "\n\n";

echo "All abilities registered:\n";
foreach (array_keys($after) as $name) {
    $ability = $after[$name];
    $meta = $ability->get_meta();
    echo "  - $name (mcp.public: " . ($meta['mcp']['public'] ?? false) . ")\n";
}
