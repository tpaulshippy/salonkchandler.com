<?php
require_once 'wp-load.php';

echo "=== CHECKING LOADING ORDER ===\n";

// 1. First, check what happens in wp-settings.php
echo "MU plugins: " . count(wp_get_mu_plugins()) . "\n";

// 2. Get the list of loaded mu-plugins
$mus = wp_get_mu_plugins();
foreach ($mus as $mu) {
    echo "  MU: $mu\n";
}

// 3. Check the hook after loading
$abilities = wp_get_abilities();
echo "Abilities after wp-load: " . count($abilities) . "\n";

// 4. Manually trigger the hook
echo "\n=== Running wp_abilities_api_init manually ===\n";
do_action('wp_abilities_api_init');

$abilities = wp_get_abilities();
echo "Abilities after manual hook: " . count($abilities) . "\n";
