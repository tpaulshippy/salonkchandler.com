<?php
/**
 * Test script to verify abilities registration via web request
 */

// Bootstrap WordPress
require_once '/var/www/wordpress/wp-load.php';

echo "=== Testing Abilities Registration ===\n\n";

// Get all registered abilities
$abilities = wp_get_abilities();
echo "Total abilities: " . count($abilities) . "\n\n";

// List all ability names
echo "All ability names:\n";
foreach (array_keys($abilities) as $name) {
    $ability = $abilities[$name];
    $meta = $ability->get_meta();
    $is_public = $meta['mcp']['public'] ?? false;
    echo "  - $name (mcp.public: " . ($is_public ? 'true' : 'false') . ")\n";
}

// Test the MCP adapter ability discovery
echo "\n=== Testing MCP Adapter Discover ===\n";

$discovered = [];
foreach (wp_get_abilities() as $ability_name => $ability) {
    $meta = $ability->get_meta();
    $is_public = $meta['mcp']['public'] ?? false;
    if ($is_public) {
        $discovered[] = [
            'name' => $ability_name,
            'label' => $ability->get_label(),
            'description' => $ability->get_description()
        ];
    }
}

echo "Discoverable abilities (mcp.public=true): " . count($discovered) . "\n";
foreach ($discovered as $d) {
    echo "  - " . $d['name'] . ": " . $d['label'] . "\n";
}
