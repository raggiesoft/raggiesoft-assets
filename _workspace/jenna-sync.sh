#!/bin/bash

# --- JENNA: THE DEVELOPMENT LIAISON (v5.5 - The "Smoking Gun" Fix) ---
# "Okay, I was looking in the wrong drawer. Found them now!"
# Usage: ./jenna-sync.sh --push "Message"

# 1. ESTABLISH PATHS (Relative for PHP)
WORKSPACE_DIR=$(cd "$(dirname "$0")" && pwd)
ASSETS_ROOT=$(cd "$WORKSPACE_DIR/.." && pwd)
HUB_ROOT=$(cd "$ASSETS_ROOT/../raggiesoft-hub" && pwd)

# 2. DETECT RCLONE
RCLONE_BIN=""
RCLONE_CONF="$WORKSPACE_DIR/build-tools/rclone/rclone.conf"

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    if [ -f "$WORKSPACE_DIR/build-tools/rclone/rclone.exe" ]; then
        RCLONE_BIN="$WORKSPACE_DIR/build-tools/rclone/rclone.exe"
    else
        echo "👱‍♀️ JENNA: I can't find rclone.exe! Check build-tools?"
        exit 1
    fi
else
    if command -v rclone &> /dev/null; then
        RCLONE_BIN="rclone"
    elif [ -f "$WORKSPACE_DIR/build-tools/rclone/rclone" ]; then
        RCLONE_BIN="$WORKSPACE_DIR/build-tools/rclone/rclone"
    else
        echo "👱‍♀️ JENNA: I can't find the rclone binary anywhere!"
        exit 1
    fi
fi

if [ ! -f "$RCLONE_CONF" ]; then
    echo "👱‍♀️ JENNA: Uh oh, I'm missing my credentials (rclone.conf)!"
    exit 1
fi

# 3. JENNA'S BRAIN

function show_help() {
    echo "Usage: ./jenna-sync.sh --push \"Commit Message\""
}

# --- THE QA VALIDATOR ---
function run_integrity_check() {
    echo "👱‍♀️ JENNA: QA Protocol Initiated..."
    echo "          (Scanning routes for broken links and accessibility violations...)"

    # Pass the relative path to the PHP script
    RELATIVE_HUB_PATH="../raggiesoft-hub"

    php -r "
        // Resolve absolute path from PHP side (100% reliable on Windows)
        \$hubRoot = realpath(__DIR__ . '/../../raggiesoft-hub');

        if (!\$hubRoot || !is_dir(\$hubRoot)) {
             echo \"❌ CRITICAL: PHP could not find the Hub folder!\\n\";
             echo \"   Attempted to resolve: \" . __DIR__ . '/../../raggiesoft-hub' . \"\\n\";
             exit(1);
        }

        \$hasErrors = false;
        
        // 1. Find all Route JSONs (UPDATED PATH: /data/routes)
        \$pattern = \$hubRoot . '/data/routes/*.json';
        \$files = glob(\$pattern);
        
        if (empty(\$files)) {
            echo \"❌ CRITICAL: No route files found!\\n\";
            echo \"   Looking in: \$pattern\\n\";
            exit(1);
        }

        foreach(\$files as \$f) {
            \$filename = basename(\$f);
            \$json = file_get_contents(\$f);
            \$data = json_decode(\$json, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo \"❌ JSON SYNTAX ERROR: \$filename is malformed!\\n\";
                \$hasErrors = true;
                continue;
            }

            foreach(\$data as \$route => \$config) {
                
                // CHECK A: WCAG / Section 508 (Alt Text)
                if (isset(\$config['navbarBrandLogo']) && !empty(\$config['navbarBrandLogo'])) {
                    if (!isset(\$config['navbarBrandAlt']) || empty(trim(\$config['navbarBrandAlt']))) {
                        echo \"❌ WCAG FAIL: [\$filename] Route '\$route' has a Logo but NO Alt Text!\\n\";
                        \$hasErrors = true;
                    }
                }

                // CHECK B: Broken Views (PHP File Missing)
                if (isset(\$config['view'])) {
                    \$viewPath = \$hubRoot . '/' . \$config['view'] . '.php';
                    
                    // Normalize slashes for Windows check
                    \$viewPath = str_replace('/', DIRECTORY_SEPARATOR, \$viewPath);
                    
                    if (!file_exists(\$viewPath)) {
                        echo \"❌ 404 FAIL:  [\$filename] Route '\$route' points to missing file: \\n\";
                        echo \"             -> \$viewPath\\n\";
                        \$hasErrors = true;
                    }
                }
            }
        }

        if (\$hasErrors) {
            exit(1); 
        }
        exit(0); 
    "

    if [ $? -ne 0 ]; then
        echo ""
        echo "========================================"
        echo "🛑 JENNA: INTEGRITY CHECK FAILED."
        echo "========================================"
        echo "I cannot push broken code. See errors above."
        exit 1
    else
        echo "✅ JENNA: Integrity check passed. Proceeding..."
    fi
}

function do_pull() {
    echo "👱‍♀️ JENNA: On it! Bringing everything down to your machine..."
    
    echo "   1. Checking the Hub (Code)..."
    if [ -d "$HUB_ROOT" ]; then
        cd "$HUB_ROOT" && git pull origin main
    else
        echo "      ⚠️  Wait, where is the Hub folder? ($HUB_ROOT)"
    fi
    
    echo "   2. Checking the Assets (Workspace)..."
    cd "$ASSETS_ROOT" && git pull origin main
    
    echo "   3. Hauling the heavy boxes (DigitalOcean Spaces)..."
    "$RCLONE_BIN" sync do-spaces:assets.raggiesoft.com "$ASSETS_ROOT" \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        -P --transfers=8
        
    echo "👱‍♀️ JENNA: All done! Your local files are perfectly synced."
}

function do_push() {
    COMMIT_MSG="$1"

    # 1. GUARDRAIL
    if [[ -z "$COMMIT_MSG" ]]; then
        echo "🛑 JENNA: MISSING COMMIT MESSAGE"
        echo "Usage: ./jenna-sync.sh --push \"Your message here\""
        exit 1
    fi

    # 2. QA Check
    run_integrity_check

    # 3. HUB PUSH
    echo "👱‍♀️ JENNA: Shipping it! Message: \"$COMMIT_MSG\""
    
    echo "   1. Packaging the Hub..."
    if [ -d "$HUB_ROOT" ]; then
        cd "$HUB_ROOT"
        git add .
        if ! git diff-index --quiet HEAD --; then
             git commit -m "$COMMIT_MSG"
             git push origin main
             echo "      ✓ Code sent to GitHub."
        else
             echo "      (Nothing new in the Hub code, skipping.)"
        fi
    fi
    
    # 4. ASSETS PUSH
    echo "   2. Packaging the Workspace..."
    cd "$ASSETS_ROOT"
    git add .
    if ! git diff-index --quiet HEAD --; then
        git commit -m "$COMMIT_MSG"
        git push origin main
        echo "      ✓ Workspace synced to GitHub."
    else
        echo "      (Assets repo looks unchanged.)"
    fi
    
    # 5. CDN SYNC
    echo "   3. Beaming heavy assets to the CDN..."
    "$RCLONE_BIN" copy "$ASSETS_ROOT" do-spaces:assets.raggiesoft.com \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        --exclude ".gitignore" \
        -P --transfers=8
        
    echo "👱‍♀️ JENNA: Success! Sarah will pick this up shortly."
}

# 4. EXECUTE
case "$1" in
    --pull) do_pull ;;
    --push) do_push "$2" ;; 
    *) show_help ;;
esac