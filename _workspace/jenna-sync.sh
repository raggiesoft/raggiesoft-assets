#!/bin/bash

# --- JENNA: THE DEVELOPMENT LIAISON (v6.6 - The "Safety Catch" Update) ---
# "Wait, you linked this page but it's marked as a Draft? I flagged it."
# Usage: ./jenna-sync.sh --push "Message"

# 1. ESTABLISH PATHS
WORKSPACE_DIR=$(cd "$(dirname "$0")" && pwd)
ASSETS_ROOT=$(cd "$WORKSPACE_DIR/.." && pwd)
HUB_ROOT=$(cd "$ASSETS_ROOT/../raggiesoft-hub" && pwd)
LOGS_DIR="$WORKSPACE_DIR/logs"

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
    echo "Usage: "
    echo "  ./jenna-sync.sh --push \"Commit Message\"  (Syncs code, assets, and runs checks)"
    echo "  ./jenna-sync.sh --pull                   (Downloads everything to local)"
    echo "  ./jenna-sync.sh --audit                  (Runs the Page Orphan Audit only)"
}

# --- THE QA VALIDATOR ---
function run_integrity_check() {
    echo "👱‍♀️ JENNA: QA Protocol Initiated..."
    echo "          (Scanning routes for broken links and accessibility violations...)"

    # Execute PHP from the workspace directory to ensure relative paths work
    (
        cd "$WORKSPACE_DIR" && php -r "
            // Resolve path relative to _workspace (../../raggiesoft-hub)
            \$hubRoot = realpath('../../raggiesoft-hub');

            if (!\$hubRoot || !is_dir(\$hubRoot)) {
                 echo \"❌ CRITICAL: PHP could not find the Hub folder!\\n\";
                 echo \"   (Looked for: ../../raggiesoft-hub from \" . getcwd() . \")\\n\";
                 exit(1);
            }

            \$hasErrors = false;
            
            // 1. Find all Route JSONs
            \$pattern = \$hubRoot . '/data/routes/*.json';
            \$files = glob(\$pattern);
            
            if (empty(\$files)) {
                echo \"❌ CRITICAL: No route files found!\\n\";
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
                        \$viewPath = str_replace('/', DIRECTORY_SEPARATOR, \$viewPath);
                        
                        if (!file_exists(\$viewPath)) {
                            echo \"❌ 404 FAIL:  [\$filename] Route '\$route' points to missing file: \\n\";
                            echo \"             -> \$viewPath\\n\";
                            \$hasErrors = true;
                        }
                    }
                }
            }

            if (\$hasErrors) { exit(1); }
            exit(0); 
        "
    )

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

# --- THE ORPHAN AUDITOR ---
function run_orphan_audit() {
    echo "👱‍♀️ JENNA: Starting Orphaned Page Audit..."
    echo "          (Scanning for unlinked PHP files, drafts, and exposed secrets...)"
    
    # Create logs directory if it doesn't exist
    if [ ! -d "$LOGS_DIR" ]; then
        mkdir -p "$LOGS_DIR"
    fi
    
    # Pass timestamp variables to PHP safely
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    PRETTY_DATE=$(date +"%Y-%m-%d %H:%M:%S")

    # Run PHP inside the workspace dir so we don't fight with path formats
    (
        cd "$WORKSPACE_DIR" && php -r "
            \$timestamp = \$argv[1];
            \$prettyDate = \$argv[2];

            // 1. RESOLVE PATHS
            \$hubRoot = realpath('../../raggiesoft-hub');
            \$logsDir = __DIR__ . '/logs'; 

            if (!\$hubRoot) { 
                die(\"❌ PHP Error: Cannot find Hub root.\\n\"); 
            }

            // 2. GATHER ALL DEFINED VIEWS
            \$definedViews = [];
            \$routesDir = \$hubRoot . '/data/routes';
            
            if (is_dir(\$routesDir)) {
                \$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(\$routesDir));
                foreach (\$iterator as \$file) {
                    if (\$file->isFile() && strtolower(\$file->getExtension()) === 'json') {
                        \$json = json_decode(file_get_contents(\$file->getPathname()), true);
                        if (is_array(\$json)) {
                            // Merge Common Block
                            if (isset(\$json['common'])) {
                                \$common = \$json['common'];
                                unset(\$json['common']);
                                foreach (\$json as \$k => \$v) {
                                    \$json[\$k] = array_merge(\$common, \$v);
                                }
                            }

                            foreach (\$json as \$route => \$config) {
                                // CASE A: Explicit View
                                if (isset(\$config['view'])) {
                                    \$definedViews[] = str_replace(['\\\\', '/'], '/', \$config['view']);
                                } 
                                // CASE B: Implicit View (Auto-Discovery)
                                else {
                                    \$potentialPath = 'pages' . \$route; 
                                    \$potentialPath = str_replace('//', '/', \$potentialPath);
                                    
                                    \$absCheck = \$hubRoot . '/' . \$potentialPath;
                                    
                                    if (file_exists(\$absCheck . '.php')) {
                                        \$definedViews[] = \$potentialPath;
                                    } elseif (is_dir(\$absCheck)) {
                                        if (file_exists(\$absCheck . '/overview.php')) {
                                            \$definedViews[] = \$potentialPath . '/overview';
                                        } elseif (file_exists(\$absCheck . '/home.php')) {
                                            \$definedViews[] = \$potentialPath . '/home';
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            \$definedViews = array_unique(\$definedViews);

            // 3. SCAN PAGES DIRECTORY
            \$pagesDir = \$hubRoot . '/pages';
            \$orphans = [];
            \$drafts = [];
            \$exposed = [];

            if (is_dir(\$pagesDir)) {
                \$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(\$pagesDir));
                foreach (\$iterator as \$file) {
                    if (\$file->isFile() && strtolower(\$file->getExtension()) === 'php') {
                        // Normalize paths
                        \$fullPath = str_replace('\\\\', '/', \$file->getPathname());
                        \$rootPath = str_replace('\\\\', '/', \$hubRoot);
                        \$relativePath = ltrim(str_replace(\$rootPath, '', \$fullPath), '/');
                        \$viewId = preg_replace('/\.php$/', '', \$relativePath);
                        
                        // Ignore template/error pages
                        if (strpos(\$viewId, 'template') !== false) continue;
                        if (strpos(\$viewId, 'errors/') !== false) continue;

                        // READ CONTENT (To check H1 and Tags)
                        \$content = file_get_contents(\$file->getPathname());
                        
                        // Grab Title
                        \$title = '(No H1 Found)';
                        if (preg_match('/<h1[^>]*>(.*?)<\/h1>/si', \$content, \$matches)) {
                            \$title = trim(strip_tags(\$matches[1]));
                            \$title = preg_replace('/\s+/', ' ', \$title);
                        }

                        \$entry = [
                            'dir' => dirname(\$relativePath),
                            'file' => basename(\$relativePath),
                            'title' => \$title
                        ];
                        
                        // CHECK STATUS
                        \$isLinked = in_array(\$viewId, \$definedViews);
                        \$isDraft = (stripos(\$content, 'JENNA: DRAFT') !== false);

                        if (\$isLinked && \$isDraft) {
                            // CRITICAL: Linked but marked as Draft
                            \$exposed[] = \$entry;
                        } elseif (!\$isLinked && \$isDraft) {
                            // SAFE: Unlinked Draft
                            \$drafts[] = \$entry;
                        } elseif (!\$isLinked && !\$isDraft) {
                            // CLUTTER: Unlinked and NOT marked
                            \$orphans[] = \$entry;
                        }
                    }
                }
            }

            // 4. LOGGING
            \$totalIssues = count(\$orphans) + count(\$drafts) + count(\$exposed);
            
            if (\$totalIssues > 0) {
                \$filename = \$timestamp . '_Jenna_Audit_Report.txt';
                \$logPath = \$logsDir . '/' . \$filename;
                
                \$output = \"JENNA'S PAGE AUDIT REPORT\\n\";
                \$output .= \"Generated: \" . \$prettyDate . \" (System Local Time)\\n\";
                \$output .= \"Summary:   \" . count(\$orphans) . \" Orphans | \" . count(\$drafts) . \" Drafts | \" . count(\$exposed) . \" EXPOSED\\n\\n\";
                
                if (!empty(\$exposed)) {
                    \$output .= \"===================================================\\n\";
                    \$output .= \"🚨 EXPOSED DRAFTS (Linked in JSON but marked Draft)\\n\";
                    \$output .= \"===================================================\\n\";
                    foreach (\$exposed as \$e) {
                        \$output .= \"File:  \" . \$e['dir'] . \"/\" . \$e['file'] . \"\\n\";
                        \$output .= \"Title: \" . \$e['title'] . \"\\n\";
                        \$output .= \"---------------------------------------------------\\n\";
                    }
                    \$output .= \"\\n\";
                    
                    // Console Alert
                    echo \"🚨 JENNA ALERT: Found \" . count(\$exposed) . \" EXPOSED Drafts! Check the log!\\n\";
                }

                if (!empty(\$drafts)) {
                    \$output .= \"===================================================\\n\";
                    \$output .= \"🚧 DETECTED DRAFTS (Safe & Unlinked)\\n\";
                    \$output .= \"===================================================\\n\";
                    foreach (\$drafts as \$d) {
                        \$output .= \"File:  \" . \$d['dir'] . \"/\" . \$d['file'] . \"\\n\";
                        \$output .= \"Title: \" . \$d['title'] . \"\\n\";
                        \$output .= \"---------------------------------------------------\\n\";
                    }
                    \$output .= \"\\n\";
                }

                if (!empty(\$orphans)) {
                    \$output .= \"===================================================\\n\";
                    \$output .= \"⚠️  ORPHANED PAGES (Not linked in any JSON)\\n\";
                    \$output .= \"===================================================\\n\";
                    foreach (\$orphans as \$o) {
                        \$output .= \"File:  \" . \$o['dir'] . \"/\" . \$o['file'] . \"\\n\";
                        \$output .= \"Title: \" . \$o['title'] . \"\\n\";
                        \$output .= \"---------------------------------------------------\\n\";
                    }
                }
                
                file_put_contents(\$logPath, \$output);
                
                echo \"⚠️  JENNA: Audit found items.\\n\";
                if (count(\$exposed) > 0) echo \"          \" . count(\$exposed) . \" EXPOSED Drafts (Linked!)\\n\";
                echo \"          \" . count(\$orphans) . \" Orphans (Unlinked)\\n\";
                echo \"          \" . count(\$drafts) . \" Drafts (Marked)\\n\";
                echo \"          Report saved to: /logs/\" . \$filename . \"\\n\";
            } else {
                echo \"✅ JENNA: Clean ship! No orphans, drafts, or exposed files.\\n\";
            }
        " -- "$TIMESTAMP" "$PRETTY_DATE"
    )

    echo "          (Audit complete. This is non-fatal.)"
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

    if [[ -z "$COMMIT_MSG" ]]; then
        echo "🛑 JENNA: MISSING COMMIT MESSAGE"
        echo "Usage: ./jenna-sync.sh --push \"Your message here\""
        exit 1
    fi

    # 1. QA Check
    run_integrity_check

    # 2. Orphan Audit (Non-fatal)
    run_orphan_audit

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
    --audit) run_orphan_audit ;;
    *) show_help ;;
esac