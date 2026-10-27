<?php
require_once '/var/www/wordpress/wp-load.php';

echo "=== Testing Loading Order ===\n\n";

// Check what hooks are registered
global $wp_filter;
$hook = 'wp_abilities_api_init';

echo "Current callbacks on '$hook':\n";
if (isset($wp_filter[$hook])) {
    foreach ($wp_filter[$hook]->callbacks as $priority => $cbs) {
        echo "  Priority $priority: " . count($cbs) . " callbacks\n";
    }
} else {
    echo "  (none)\n";
}

// Check mu-plugins
$mus = wp_get_mu_plugins();
echo "\nMU plugins loaded:\n";
foreach ($mus as $mu) {
    echo "  $mu\n";
}

// Now test manually running do_action after including plugin
echo "\n=== Running hook manually ===\n";
do_action('wp_abilities_api_init');
echo "Abilities after hook: " . count(wp_get_abilities()) . "\n";
