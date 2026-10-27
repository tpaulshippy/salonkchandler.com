<?php
require_once '/var/www/wordpress/wp-load.php';

echo "=== Full Ability Test ===\n";
echo "Total: " . count(wp_get_abilities()) . " abilities\n\n";

foreach (wp_get_abilities() as $name => $ability) {
    $meta = $ability->get_meta();
    $public = $meta['mcp']['public'] ?? false;
    $hasExec = method_exists($ability, 'execute');
    echo "Name: $name\n";
    echo "  Public: " . ($public ? 'yes' : 'no') . "\n";
    echo "  Has execute: " . ($hasExec ? 'yes' : 'no') . "\n";
    echo "\n";
}
