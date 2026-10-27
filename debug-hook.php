<?php
require_once 'wp-load.php';

$hook_name = 'wp_abilities_api_init';
global $wp_filter;

echo "=== BEFORE including plugin ===\n";
if (isset($wp_filter[$hook_name])) {
    echo "Hook has " . count($wp_filter[$hook_name]->callbacks) . " callback groups\n";
    foreach ($wp_filter[$hook_name]->callbacks as $priority => $cbs) {
        foreach ($cbs as $cb) {
            $fn = $cb["function"];
            if (is_array($fn)) {
                echo "  Priority $priority: " . (is_object($fn[0]) ? get_class($fn[0]) : $fn[0]) . "->" . $fn[1] . "\n";
            } elseif ($fn instanceof Closure) {
                echo "  Priority $priority: Closure\n";
            } else {
                echo "  Priority $priority: (other)\n";
            }
        }
    }
} else {
    echo "Hook not found\n";
}

// Now include the plugin
include_once WP_CONTENT_DIR . '/mu-plugins/mcp-example-abilities.php';

echo "\n=== AFTER including plugin ===\n";
if (isset($wp_filter[$hook_name])) {
    echo "Hook has " . count($wp_filter[$hook_name]->callbacks) . " callback groups\n";
    foreach ($wp_filter[$hook_name]->callbacks as $priority => $cbs) {
        foreach ($cbs as $cb) {
            $fn = $cb["function"];
            if (is_array($fn)) {
                echo "  Priority $priority: " . (is_object($fn[0]) ? get_class($fn[0]) : $fn[0]) . "->" . $fn[1] . "\n";
            } elseif ($fn instanceof Closure) {
                echo "  Priority $priority: Closure\n";
            } else {
                echo "  Priority $priority: (other)\n";
            }
        }
    }
} else {
    echo "Hook not found\n";
}

// Run the hook
echo "\n=== RUNNING hook ===\n";
do_action($hook_name);

echo "\n=== Abilities after hook ===\n";
$abilities = wp_get_abilities();
echo "Count: " . count($abilities) . "\n";
echo "Keys: " . implode(", ", array_keys($abilities)) . "\n";
