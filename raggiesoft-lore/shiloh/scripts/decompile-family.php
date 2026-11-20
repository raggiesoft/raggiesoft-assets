#!/usr/bin/env php
<?php
/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: decompile-family.php (Shiloh Lore Unpacker)
 * ============================================================================
 * WHAT THIS FILE IS:
 *   The exact inverse companion to `compile-family.php`. When bulk edits are
 *   made to the single aggregated `compiled_world_data.json` or
 *   `compiled_world_lore.md` files, running this CLI PHP script splits those
 *   two master bundles back out into their individual `.json` and `.md` files
 *   inside `../json/` and `../markdown/`.
 *
 * HOW IT IS RUN:
 *   Executed from the terminal via:
 *     `php decompile-family.php`   or   `./decompile-family.php`
 *   (Line 1 MUST remain `#!/usr/bin/env php` so Unix shells know how to invoke it.)
 *
 * WHAT INPUTS IT CONSUMES:
 *   1. `./compiled/compiled_world_data.json` (containing `_source_file` metadata).
 *   2. `./compiled/compiled_world_lore.md` (containing `## [FILE: path/to/file.md]`
 *      boundary markers and trailing `---` separators).
 *
 * WHAT OUTPUT IT PRODUCES:
 *   - Recreates any missing subfolders and writes clean individual `.json` files
 *     (with temporary `_source_file` keys stripped back out) into `../json/`
 *     and individual `.md` files into `../markdown/`.
 *
 * 100-LEVEL PHP CLI CONCEPTS TAUGHT IN THIS FILE:
 *   - Accumulator Buffering (`$pendingGroupedData`): Reassembling multi-key
 *     group JSON files that `array_replace_recursive` flattened at the root.
 *   - Safe Delimiter Splitting (`explode('## [FILE: ', ...)`): Why splitting on
 *     the explicit `## [FILE: ` header is safe even when a Markdown document
 *     has its own `---` YAML frontmatter or horizontal rules inside its body!
 *   - Recursive Directory Creation (`mkdir(dirname($filePath), 0755, true)`).
 * ============================================================================
 */

/* STEP 1: DEFINE INPUT BUNDLE PATHS & TARGET OUTPUT DIRECTORIES
 * Note the Elvis operator `?:` on `realpath(...)`: if `../json` or `../markdown`
 * was deleted before decompiling, `realpath()` returns `false`, so `?:` falls
 * back to the raw string path so `ensureDir()` can recreate the folder from scratch! */
$compiledDir = __DIR__ . '/compiled';
$jsonInputFile = $compiledDir . '/compiled_world_data.json';
$mdInputFile = $compiledDir . '/compiled_world_lore.md';

$outputJsonDir = realpath(__DIR__ . '/../json') ?: __DIR__ . '/../json';
$outputMdDir = realpath(__DIR__ . '/../markdown') ?: __DIR__ . '/../markdown';

/**
 * Helper: Ensures the parent folder of `$filePath` exists before `file_put_contents()`.
 * For example, given `../json/characters/family/ava.json`, `dirname($filePath)`
 * extracts `../json/characters/family`, and `mkdir(..., 0755, true)` creates any
 * missing intermediate directories in one call.
 */
function ensureDir($filePath) {
    $dir = dirname($filePath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

/* ============================================================================
 * STEP 2: DECOMPILE `compiled_world_data.json` -> INDIVIDUAL `.json` FILES
 * ============================================================================ */
if (file_exists($jsonInputFile)) {
    echo "Decompiling JSON data...\n";
    $jsonContent = file_get_contents($jsonInputFile);
    /* Decode JSON text into an associative PHP array (`true` = arrays, not objects). */
    $masterData = json_decode($jsonContent, true);

    if ($masterData) {
        /* Buffer used for grouped collection files (like `hospitals` or `places`).
         * Remember how `compile-family.php` merged grouped files with
         * `array_replace_recursive($masterData, $data)` after setting
         * `$data['_source_file'] = $relativePath`? In the compiled JSON, that
         * places the group arrays (e.g. `"places": { ... }`) right BEFORE a
         * top-level `"_source_file": "places/locations.json"` string key! */
        $pendingGroupedData = [];

        foreach ($masterData as $key => $value) {
            /* SCENARIO A: We hit a top-level `"_source_file"` string key!
             * Flush everything we buffered in `$pendingGroupedData` into that
             * destination file, then reset `$pendingGroupedData` to empty. */
            if ($key === '_source_file') {
                $fullPath = $outputJsonDir . '/' . $value;
                ensureDir($fullPath);
                
                file_put_contents($fullPath, json_encode($pendingGroupedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                $pendingGroupedData = []; 
                continue;
            }

            /* SCENARIO B: Individual entity object (e.g., a character card) that
             * carries its own nested `$value['_source_file']` property. */
            if (is_array($value) && isset($value['_source_file'])) {
                $sourceFile = $value['_source_file'];
                /* Remove the compiler's temporary `_source_file` breadcrumb so
                 * the restored `.json` file matches the clean original schema. */
                unset($value['_source_file']);

                $fullPath = $outputJsonDir . '/' . $sourceFile;
                ensureDir($fullPath);
                file_put_contents($fullPath, json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            } else {
                /* SCENARIO C: A grouped root array (like `'hospitals'` or `'places'`)
                 * that doesn't carry its own inner `_source_file`. Hold it in
                 * `$pendingGroupedData` until Scenario A hits its trailing `_source_file`. */
                $pendingGroupedData[$key] = $value;
            }
        }
    } else {
        echo "Warning: Could not parse compiled JSON file.\n";
    }
} else {
    echo "Warning: Compiled JSON not found at {$jsonInputFile}\n";
}

/* ============================================================================
 * STEP 3: DECOMPILE `compiled_world_lore.md` -> INDIVIDUAL `.md` FILES
 * ============================================================================ */
if (file_exists($mdInputFile)) {
    echo "Decompiling Markdown lore...\n";
    $mdContent = file_get_contents($mdInputFile);
    
    /* Split the master Markdown string at every `## [FILE: ` marker!
     * Why NOT `explode('---', $mdContent)`? Because individual Markdown files
     * often start with `---` YAML frontmatter or use `---` scene breaks inside
     * their prose—splitting on `---` would shred a single file into pieces!
     * `## [FILE: ` only appears at true file boundaries written by the compiler. */
    $blocks = explode('## [FILE: ', $mdContent);
    
    /* `$blocks[0]` is just the top `# Master World Context (Compiled)` preamble
     * before the very first `## [FILE: ` marker—discard it with `array_shift()`. */
    array_shift($blocks); 

    foreach ($blocks as $block) {
        /* Each `$block` starts like: `characters/shiloh.md]\n\n# Shiloh...\n\n---\n\n`
         * Find the closing `]` bracket of the `[FILE: ...]` header. */
        $bracketPos = strpos($block, ']');
        if ($bracketPos !== false) {
            /* Everything before `]` is the relative file path; everything after `]` is the body. */
            $relativePath = trim(substr($block, 0, $bracketPos));
            $content = substr($block, $bracketPos + 1);

            /* Trim trailing whitespace/newlines, then strip the single `---` chunk
             * separator that `compile-family.php` appended at the very end of the block
             * (leaving any internal `---` dividers earlier in `$content` intact!). */
            $content = rtrim($content);
            if (substr($content, -3) === '---') {
                $content = rtrim(substr($content, 0, -3));
            }
            
            $fullPath = $outputMdDir . '/' . $relativePath;
            ensureDir($fullPath);
            
            /* Write the restored Markdown file ending with a single clean POSIX newline `\n`. */
            file_put_contents($fullPath, trim($content) . "\n");
        }
    }
} else {
    echo "Warning: Compiled Markdown not found at {$mdInputFile}\n";
}

echo "Decompilation complete!\n";
?>
