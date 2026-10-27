<?php
/**
 * Plugin Name: MCP Example Abilities
 * Description: Example WordPress abilities for MCP integration
 */

add_action('wp_abilities_api_init', function() {

    wp_register_ability('example/get-site-info', [
        'label' => 'Get Site Info',
        'description' => 'Get basic WordPress site information',
        'category' => 'site',
        'input_schema' => ['type' => 'object', 'properties' => []],
        'output_schema' => ['type' => 'object'],
        'execute_callback' => function($input) {
            return [
                'name' => get_bloginfo('name'),
                'description' => get_bloginfo('description'),
                'url' => get_bloginfo('url'),
                'version' => get_bloginfo('version')
            ];
        },
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'meta' => ['mcp' => ['public' => true]]
    ]);

    wp_register_ability('example/list-plugins', [
        'label' => 'List Plugins',
        'description' => 'Get a list of installed WordPress plugins',
        'category' => 'site',
        'input_schema' => [
            'type' => 'object',
            'properties' => ['status' => ['type' => 'string', 'enum' => ['active', 'inactive', 'all'], 'default' => 'active']]
        ],
        'output_schema' => ['type' => 'array'],
        'execute_callback' => function($input) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
            $plugins = get_plugins();
            $active = get_option('active_plugins');
            $result = [];
            foreach ($plugins as $name => $p) {
                $result[] = [
                    'name' => $p['Name'],
                    'status' => in_array($name, $active) ? 'active' : 'inactive',
                    'version' => $p['Version']
                ];
            }
            return $result;
        },
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'meta' => ['mcp' => ['public' => true]]
    ]);

    wp_register_ability('example/list-posts', [
        'label' => 'List Posts',
        'description' => 'Get a list of recent posts with optional filtering',
        'category' => 'content',
        'input_schema' => [
            'type' => 'object',
            'properties' => [
                'numberposts' => [
                    'type' => 'integer',
                    'description' => 'Number of posts to retrieve',
                    'default' => 10,
                    'minimum' => 1,
                    'maximum' => 100
                ],
                'post_status' => [
                    'type' => 'string',
                    'description' => 'Post status to filter by',
                    'enum' => ['publish', 'draft', 'private', 'any'],
                    'default' => 'publish'
                ]
            ]
        ],
        'output_schema' => ['type' => 'array'],
        'execute_callback' => function($input) {
            $posts = get_posts([
                'numberposts' => $input['numberposts'] ?? 10,
                'post_status' => $input['post_status'] ?? 'publish'
            ]);
            $result = [];
            foreach ($posts as $post) {
                $result[] = [
                    'ID' => $post->ID,
                    'title' => $post->post_title,
                    'status' => $post->post_status,
                    'date' => $post->post_date
                ];
            }
            return $result;
        },
        'permission_callback' => function() {
            return current_user_can('read');
        },
        'meta' => ['mcp' => ['public' => true]]
    ]);

    wp_register_ability('example/create-post', [
        'label' => 'Create Post',
        'description' => 'Create a new WordPress post',
        'category' => 'content',
        'input_schema' => [
            'type' => 'object',
            'properties' => [
                'post_title' => ['type' => 'string', 'description' => 'Post title'],
                'post_content' => ['type' => 'string', 'description' => 'Post content'],
                'post_status' => ['type' => 'string', 'enum' => ['draft', 'publish', 'pending'], 'default' => 'draft']
            ],
            'required' => ['post_title', 'post_content']
        ],
        'output_schema' => ['type' => 'object'],
        'execute_callback' => function($input) {
            $post_id = wp_insert_post([
                'post_title' => $input['post_title'],
                'post_content' => $input['post_content'],
                'post_status' => $input['post_status'] ?? 'draft'
            ]);
            if (is_wp_error($post_id)) {
                return ['success' => false, 'error' => $post_id->get_error_message()];
            }
            return ['success' => true, 'ID' => $post_id, 'url' => get_permalink($post_id)];
        },
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'meta' => ['mcp' => ['public' => true]]
    ]);

}, 10, 0);
