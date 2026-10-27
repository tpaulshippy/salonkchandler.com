<?php
require_once 'wp-load.php';

echo "=== Simple test: direct wp_register_ability call ===\n";

// Include the plugin first to ensure the function is available
include WP_CONTENT_DIR . '/mu-plugins/mcp-example-abilities.php';

// Test if function exists and try to call it directly
echo "Testing direct call to wp_register_ability...\n";

$result = wp_register_ability('test/simple', [
    'label' => 'Simple Test',
    'description' => 'A simple test ability',
    'category' => 'test',
    'execute_callback' => function() { return ['success' => true, 'message' => 'Hello from test!']; },
    'permission_callback' => function() { return true; },
    'meta' => ['mcp' => ['public' => true]]
]);

echo "Result of registration: " . ($result ? "success" : "FAILED") . "\n";

$abilities = wp_get_abilities();
echo "Total abilities: " . count($abilities) . "\n";
echo "Ability keys:\n";
foreach (array_keys($abilities) as $key) {
    echo "  - $key\n";
}
