<?php
require_once 'wp-load.php';

echo "Testing if plugin file runs properly...\n";

// Check if plugin file can be required
$file = WP_CONTENT_DIR . '/mu-plugins/mcp-example-abilities.php';
echo "File path: $file\n";
echo "File exists: " . (file_exists($file) ? "yes" : "no") . "\n";

// Try to include just the file (not do_action)
echo "\nIncluding plugin file without running hooks...\n";
include $file;

echo "Done including.\n";
echo "Now checking if abilities were registered...\n";
$abilities = wp_get_abilities();
echo "Count: " . count($abilities) . "\n";
print_r(array_keys($abilities));
