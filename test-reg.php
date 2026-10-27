<?php
require_once '/var/www/wordpress/wp-load.php';

echo "Testing ability registration with debug output...\n";

error_reporting(E_ALL);
ini_set('display_errors', 1);

$ability_name = 'test/debug-test';
$args = [
    'label' => 'Debug Test',
    'description' => 'Test ability registration',
    'category' => 'test',
    'input_schema' => ['type' => 'object'],
    'output_schema' => ['type' => 'object'],
    'execute_callback' => function() { return 'ok'; },
    'permission_callback' => function() { return true; },
    'meta' => ['mcp' => ['public' => true]]
];

echo "doing_action check: " . (doing_action('wp_abilities_api_init') ? 'yes' : 'no') . "\n";

$valid = preg_match('/^[a-z0-9-]+\/[a-z0-9-]+$/', $ability_name);
echo "Name valid: " . ($valid ? 'yes' : 'no') . "\n";
echo "Name: $ability_name\n";

echo "Attempting registration...\n";
$result = wp_register_ability($ability_name, $args);
echo "Result: " . ($result ? 'SUCCESS' : 'FAILED/NULL') . "\n";

$error = error_get_last();
if ($error) {
    echo "Error captured:\n";
    print_r($error);
}

echo "\nAll abilities now: " . count(wp_get_abilities()) . "\n";
