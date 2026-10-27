<?php
require_once '/var/www/wordpress/wp-load.php';

// Check doing_it_wrong status
echo "doing_action(wp_abilities_api_init): " . (doing_action('wp_abilities_api_init') ? 'yes' : 'no') . "\n";

// Run the hook
do_action('wp_abilities_api_init');

// Check abilities
echo "Abilities after hook: " . count(wp_get_abilities()) . "\n";
foreach (array_keys(wp_get_abilities()) as $key) {
    echo "  $key\n";
}
