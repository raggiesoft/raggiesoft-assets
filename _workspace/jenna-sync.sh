#!/bin/bash

# --- JENNA: THE DEVELOPMENT LIAISON (v7.1 - Multi-Repo Routing Edition) ---
# Usage: ./jenna-sync.sh --push -m "Message" [-t "v1.0.0"] [--public-wifi]
#        ./jenna-sync.sh --pull [--public-wifi]

# 1. ESTABLISH PATHS (Dynamically resolved across OS)
WORKSPACE_DIR=$(cd "$(dirname "$0")" && pwd)
ASSETS_ROOT=$(cd "$WORKSPACE_DIR/.." && pwd)
SERVER_ROOT=$(cd "$ASSETS_ROOT/.." && pwd)

HUB_ROOT="$SERVER_ROOT/raggiesoft-hub"
CMS_ROOT="$SERVER_ROOT/stardust-engine-cms"
NARRATIVES_ROOT="$SERVER_ROOT/raggiesoft-narratives"
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

# 3. JENNA'S BRAIN (Functions)

function show_help() {
    echo "Usage: "
    echo "  ./jenna-sync.sh --push -m \"Commit Message\" [-t \"v1.0.0\"]"
    echo "  ./jenna-sync.sh --pull"
    echo "  ./jenna-sync.sh --audit"
    echo "Options: --public-wifi (Stealth mode)"
}

function run_integrity_check() {
    echo "👱‍♀️ JENNA: QA Protocol Initiated..."
    (
        cd "$WORKSPACE_DIR" && php -r "
            \$hubRoot = realpath('../../raggiesoft-hub');
            if (!\$hubRoot || !is_dir(\$hubRoot)) { exit(1); }
            \$hasErrors = false;
            \$pattern = \$hubRoot . '/data/routes/*.json';
            \$files = glob(\$pattern);
            if (empty(\$files)) { exit(1); }

            foreach(\$files as \$f) {
                \$filename = basename(\$f);
                \$data = json_decode(file_get_contents(\$f), true);
                if (json_last_error() !== JSON_ERROR_NONE) { \$hasErrors = true; continue; }

                foreach(\$data as \$route => \$config) {
                    if (isset(\$config['navbarBrandLogo']) && !empty(\$config['navbarBrandLogo'])) {
                        if (!isset(\$config['navbarBrandAlt']) || empty(trim(\$config['navbarBrandAlt']))) {
                            echo \"❌ WCAG FAIL: [\$filename] Route '\$route' missing Alt Text!\n\";
                            \$hasErrors = true;
                        }
                    }
                    if (isset(\$config['view'])) {
                        \$viewPath = \$hubRoot . '/' . \$config['view'] . '.php';
                        if (!file_exists(str_replace('/', DIRECTORY_SEPARATOR, \$viewPath))) {
                            echo \"❌ 404 FAIL:  [\$filename] Route '\$route' missing PHP file.\n\";
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
        echo "🛑 JENNA: INTEGRITY CHECK FAILED."
        exit 1
    else
        echo "✅ JENNA: Integrity check passed. Proceeding..."
    fi
}

function run_orphan_audit() {
    echo "👱‍♀️ JENNA: Starting Orphaned Page Audit..."
    if [ ! -d "$LOGS_DIR" ]; then mkdir -p "$LOGS_DIR"; fi
    
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    PRETTY_DATE=$(date +"%Y-%m-%d %H:%M:%S")

    (
        cd "$WORKSPACE_DIR" && php -r "
            \$timestamp = \$argv[1];
            \$prettyDate = \$argv[2];
            \$hubRoot = realpath('../../raggiesoft-hub');
            \$logsDir = __DIR__ . '/logs'; 
            
            \$definedViews = [];
            \$routesDir = \$hubRoot . '/data/routes';
            
            if (is_dir(\$routesDir)) {
                \$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(\$routesDir));
                foreach (\$iterator as \$file) {
                    if (\$file->isFile() && strtolower(\$file->getExtension()) === 'json') {
                        \$json = json_decode(file_get_contents(\$file->getPathname()), true);
                        if (is_array(\$json)) {
                            if (isset(\$json['common'])) {
                                \$common = \$json['common'];
                                unset(\$json['common']);
                                foreach (\$json as \$k => \$v) { \$json[\$k] = array_merge(\$common, \$v); }
                            }
                            foreach (\$json as \$route => \$config) {
                                if (isset(\$config['view'])) {
                                    \$definedViews[] = str_replace(['\\\\', '/'], '/', \$config['view']);
                                } else {
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

            \$pagesDir = \$hubRoot . '/pages';
            \$orphans = []; \$drafts = []; \$exposed = [];

            if (is_dir(\$pagesDir)) {
                \$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(\$pagesDir));
                foreach (\$iterator as \$file) {
                    if (\$file->isFile() && strtolower(\$file->getExtension()) === 'php') {
                        \$fullPath = str_replace('\\\\', '/', \$file->getPathname());
                        \$rootPath = str_replace('\\\\', '/', \$hubRoot);
                        \$relativePath = ltrim(str_replace(\$rootPath, '', \$fullPath), '/');
                        \$viewId = preg_replace('/\.php$/', '', \$relativePath);
                        
                        if (strpos(\$viewId, 'template') !== false) continue;
                        if (strpos(\$viewId, 'errors/') !== false) continue;

                        \$content = file_get_contents(\$file->getPathname());
                        \$title = '(No H1 Found)';
                        if (preg_match('/<h1[^>]*>(.*?)<\/h1>/si', \$content, \$matches)) {
                            \$title = trim(strip_tags(\$matches[1]));
                            \$title = preg_replace('/\s+/', ' ', \$title);
                        }

                        \$entry = ['dir' => dirname(\$relativePath), 'file' => basename(\$relativePath), 'title' => \$title];
                        
                        \$isLinked = in_array(\$viewId, \$definedViews);
                        \$isDraft = (stripos(\$content, 'JENNA: DRAFT') !== false);

                        if (\$isLinked && \$isDraft) { \$exposed[] = \$entry; }
                        elseif (!\$isLinked && \$isDraft) { \$drafts[] = \$entry; }
                        elseif (!\$isLinked && !\$isDraft) { \$orphans[] = \$entry; }
                    }
                }
            }

            if (count(\$orphans) + count(\$drafts) + count(\$exposed) > 0) {
                \$filename = \$timestamp . '_Jenna_Audit_Report.txt';
                \$logPath = \$logsDir . '/' . \$filename;
                
                \$output = \"JENNA'S PAGE AUDIT REPORT\nGenerated: \" . \$prettyDate . \"\nSummary:   \" . count(\$orphans) . \" Orphans | \" . count(\$drafts) . \" Drafts | \" . count(\$exposed) . \" EXPOSED\n\n\";
                
                if (!empty(\$exposed)) {
                    \$output .= \"🚨 EXPOSED DRAFTS (Linked!)\n=================\n\";
                    foreach (\$exposed as \$e) { \$output .= \$e['file'] . \" (\" . \$e['title'] . \")\n\"; }
                    echo \"🚨 JENNA ALERT: Found \" . count(\$exposed) . \" EXPOSED Drafts!\n\";
                }
                if (!empty(\$drafts)) {
                    \$output .= \"\n🚧 DETECTED DRAFTS\n=================\n\";
                    foreach (\$drafts as \$d) { \$output .= \$d['file'] . \" (\" . \$d['title'] . \")\n\"; }
                }
                if (!empty(\$orphans)) {
                    \$output .= \"\n⚠️ ORPHANED PAGES\n=================\n\";
                    foreach (\$orphans as \$o) { \$output .= \$o['file'] . \" (\" . \$o['title'] . \")\n\"; }
                }
                file_put_contents(\$logPath, \$output);
                echo \"⚠️  Audit found items. Report saved to: /logs/\" . \$filename . \"\n\";
            } else {
                echo \"✅ JENNA: Clean ship! No orphans, drafts, or exposed files.\n\";
            }
        " -- "$TIMESTAMP" "$PRETTY_DATE"
    )
}

function generate_sitemap() {
    echo "👱‍♀️ JENNA: Generating XML Sitemap and robots.txt..."
    (
        cd "$WORKSPACE_DIR" && php -r "
            \$hubRoot = realpath('../../raggiesoft-hub');
            if (!\$hubRoot || !is_dir(\$hubRoot)) {
                echo '      ❌ ERROR: Could not resolve Hub directory path.' . PHP_EOL;
                exit(1);
            }
            
            \$routesDir = \$hubRoot . '/data/routes';
            \$sitemapPath = \$hubRoot . '/sitemap.xml';
            \$robotsPath = \$hubRoot . '/robots.txt';
            
            \$urls = [];
            
            if (is_dir(\$routesDir)) {
                \$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(\$routesDir));
                foreach (\$iterator as \$file) {
                    if (\$file->isFile() && strtolower(\$file->getExtension()) === 'json') {
                        \$jsonContent = file_get_contents(\$file->getPathname());
                        \$json = json_decode(\$jsonContent, true);
                        if (json_last_error() === JSON_ERROR_NONE && is_array(\$json)) {
                            foreach (\$json as \$route => \$config) {
                                if (\$route !== 'common' && strpos(\$route, '/') === 0) {
                                    \$urls[] = 'https://raggiesoft.com' . \$route;
                                }
                            }
                        }
                    }
                }
            }
            
            \$urls = array_unique(\$urls);
            
            \$xml = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>' . PHP_EOL;
            \$xml .= '<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">' . PHP_EOL;
            
            foreach (\$urls as \$url) {
                \$xml .= '  <url>' . PHP_EOL . '    <loc>' . htmlspecialchars(\$url) . '</loc>' . PHP_EOL . '  </url>' . PHP_EOL;
            }
            \$xml .= '</urlset>';
            
            file_put_contents(\$sitemapPath, \$xml);
            
            \$robotsContent = 'User-agent: *' . PHP_EOL . 'Sitemap: https://raggiesoft.com/sitemap.xml' . PHP_EOL;
            file_put_contents(\$robotsPath, \$robotsContent);
            
            echo '      ✓ Generated sitemap.xml with ' . count(\$urls) . ' dynamic routes.' . PHP_EOL;
            echo '      ✓ Generated robots.txt pointer.' . PHP_EOL;
        "
    )
}

function do_pull() {
    echo "👱‍♀️ JENNA: On it! Bringing everything down to your machine..."
    echo "          $CONNECTION_MSG"
    
    echo "   1. Checking the Hub (Code)..."
    if [ -d "$HUB_ROOT" ]; then cd "$HUB_ROOT" && git pull origin main; fi
    
    echo "   2. Checking the Assets (Workspace)..."
    cd "$ASSETS_ROOT" && git pull origin main
    
    echo "   3. Checking the Stardust Engine CMS..."
    if [ -d "$CMS_ROOT" ]; then cd "$CMS_ROOT" && git pull origin main; fi

    echo "   4. Checking the Narratives..."
    if [ ! -d "$NARRATIVES_ROOT" ]; then
        echo "      > Repository missing. Cloning CC BY-SA 4.0 Narratives from GitHub..."
        cd "$SERVER_ROOT" && git clone https://github.com/raggiesoft/raggiesoft-narratives.git
    else
        cd "$NARRATIVES_ROOT" && git pull origin main
    fi
    
    echo "   5. Hauling the heavy boxes (DigitalOcean Spaces)..."
    "$RCLONE_BIN" sync do-spaces:assets.raggiesoft.com "$ASSETS_ROOT" \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        --exclude ".DS_Store" \
        --exclude "desktop.ini" \
        --exclude "Thumbs.db" \
        --exclude "._*" \
        $RCLONE_PERF_FLAGS
        
    echo "👱‍♀️ JENNA: All done! Your local files are perfectly synced."
}

function do_push() {
    if [[ -z "$COMMIT_MSG" && -z "$TAG_NAME" ]]; then
        echo "🛑 JENNA: MISSING COMMIT MESSAGE"
        show_help
        exit 1
    fi
    
    if [[ -z "$COMMIT_MSG" ]]; then
        COMMIT_MSG="Jenna: Automated sync for release $TAG_NAME"
    fi

    # --- PRE-FLIGHT TAG CHECK ---
    if [ -n "$TAG_NAME" ]; then
        echo "👱‍♀️ JENNA: Validating tag '$TAG_NAME'..."
        if [ -d "$HUB_ROOT" ]; then
            cd "$HUB_ROOT"
            if git show-ref --tags "$TAG_NAME" --quiet || git ls-remote --tags origin | grep -q "refs/tags/$TAG_NAME"; then
                echo "🛑 JENNA: ABORTING! The tag '$TAG_NAME' is already used in the Hub repository."
                exit 1
            fi
        fi
        if [ -d "$CMS_ROOT" ]; then
            cd "$CMS_ROOT"
            if git show-ref --tags "$TAG_NAME" --quiet || git ls-remote --tags origin | grep -q "refs/tags/$TAG_NAME"; then
                echo "🛑 JENNA: ABORTING! The tag '$TAG_NAME' is already used in the CMS repository."
                exit 1
            fi
        fi
        if [ -d "$NARRATIVES_ROOT" ]; then
            cd "$NARRATIVES_ROOT"
            if git show-ref --tags "$TAG_NAME" --quiet || git ls-remote --tags origin | grep -q "refs/tags/$TAG_NAME"; then
                echo "🛑 JENNA: ABORTING! The tag '$TAG_NAME' is already used in the Narratives repository."
                exit 1
            fi
        fi
    fi

    # 1. QA Check
    run_integrity_check

    # 2. Orphan Audit
    run_orphan_audit

    # 3. Generate Sitemap
    generate_sitemap

    echo "👱‍♀️ JENNA: Shipping it! Message: \"$COMMIT_MSG\""
    if [ -n "$TAG_NAME" ]; then
        echo "          Applying Tag: $TAG_NAME"
    fi
    echo "          $CONNECTION_MSG"

    # 4. HUB PUSH
    echo "   1. Packaging the Hub..."
    if [ -d "$HUB_ROOT" ]; then
        cd "$HUB_ROOT"
        git add .
        
        if ! git diff-index --quiet HEAD --; then
             git commit -m "$COMMIT_MSG"
             git push origin main
             echo "      ✓ Code committed and sent to GitHub."
        elif [ "$(git log origin/main..HEAD 2>/dev/null)" ]; then
             echo "      ⚠️  Found pending commits from a previous run. Pushing now..."
             git push origin main
             echo "      ✓ Pending code sent to GitHub."
        else
             echo "      (Hub is clean and up to date.)"
        fi

        if [ -n "$TAG_NAME" ]; then
            echo "      > Stamping Hub with tag: $TAG_NAME..."
            git tag -a "$TAG_NAME" -m "Release $TAG_NAME"
            git push origin "$TAG_NAME"
            echo "      ✓ Hub Tag sent to GitHub."
        fi
    fi

    # 4.5 CMS PUSH
    echo "   -> Packaging the Stardust Engine CMS..."
    if [ -d "$CMS_ROOT" ]; then
        cd "$CMS_ROOT"
        git add .
        
        if ! git diff-index --quiet HEAD --; then
             git commit -m "$COMMIT_MSG"
             git push origin main
             echo "      ✓ CMS code committed and sent to GitHub."
        elif [ "$(git log origin/main..HEAD 2>/dev/null)" ]; then
             echo "      ⚠️  Found pending CMS commits. Pushing now..."
             git push origin main
             echo "      ✓ Pending CMS code sent to GitHub."
        else
             echo "      (CMS is clean and up to date.)"
        fi

        if [ -n "$TAG_NAME" ]; then
            echo "      > Stamping CMS with tag: $TAG_NAME..."
            git tag -a "$TAG_NAME" -m "Release $TAG_NAME"
            git push origin "$TAG_NAME"
            echo "      ✓ CMS Tag sent to GitHub."
        fi
    fi
    
    # 4.6 NARRATIVES PUSH
    echo "   -> Packaging the Narratives..."
    if [ -d "$NARRATIVES_ROOT" ]; then
        cd "$NARRATIVES_ROOT"
        git add .
        
        if ! git diff-index --quiet HEAD --; then
             git commit -m "$COMMIT_MSG"
             git push origin main
             echo "      ✓ Narratives committed and sent to GitHub."
        elif [ "$(git log origin/main..HEAD 2>/dev/null)" ]; then
             echo "      ⚠️  Found pending Narratives commits. Pushing now..."
             git push origin main
             echo "      ✓ Pending Narratives code sent to GitHub."
        else
             echo "      (Narratives are clean and up to date.)"
        fi

        if [ -n "$TAG_NAME" ]; then
            echo "      > Stamping Narratives with tag: $TAG_NAME..."
            git tag -a "$TAG_NAME" -m "Release $TAG_NAME"
            git push origin "$TAG_NAME"
            echo "      ✓ Narratives Tag sent to GitHub."
        fi
    fi

    # 5. ASSETS PUSH
    echo "   2. Packaging the Workspace..."
    cd "$ASSETS_ROOT"
    
    echo "      > Indexing files (Verbose mode active)..."
    git add -v .
    
    if ! git diff-index --quiet HEAD --; then
        echo "      > Committing changes..."
        git commit -m "$COMMIT_MSG"
        echo "      > Pushing to remote..."
        git push --progress origin main
        echo "      ✓ Workspace synced to GitHub."
    elif [ "$(git log origin/main..HEAD 2>/dev/null)" ]; then
        echo "      ⚠️  Found pending commits. Pushing now..."
        git push --progress origin main
        echo "      ✓ Pending workspace changes sent to GitHub."
    else
        echo "      (Assets repo looks unchanged.)"
    fi
    
    # 6. CDN SYNC
    echo "   3. Beaming heavy assets to the CDN..."
    "$RCLONE_BIN" copy "$ASSETS_ROOT" do-spaces:assets.raggiesoft.com \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        --exclude ".gitignore" \
        --exclude ".DS_Store" \
        --exclude "desktop.ini" \
        --exclude "Thumbs.db" \
        --exclude "._*" \
        $RCLONE_PERF_FLAGS
        
    echo "👱‍♀️ JENNA: Success! Sarah will pick this up shortly."
}

# --- UNIFIED ARGUMENT PARSER ---
ACTION=""
COMMIT_MSG=""
TAG_NAME=""
USE_PUBLIC_WIFI=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --push) ACTION="push" ;;
        --pull) ACTION="pull" ;;
        --audit) ACTION="audit" ;;
        --msg|-m) COMMIT_MSG="$2"; shift ;;
        --tag|-t) TAG_NAME="$2"; shift ;;
        --public-wifi) USE_PUBLIC_WIFI=true ;;
        *) echo "👱‍♀️ JENNA: I don't recognize the command '$1'."; show_help; exit 1 ;;
    esac
    shift
done

# Apply connection modifications based on parsing
if [ "$USE_PUBLIC_WIFI" = true ]; then
    RCLONE_PERF_FLAGS="-P --transfers=1 --tpslimit=1 --timeout=60s --user-agent \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\""
    CONNECTION_MSG="🕵️‍♀️ CAMOUFLAGE MODE: Spoofing Chrome User-Agent."
else
    RCLONE_PERF_FLAGS="-P --transfers=8"
    CONNECTION_MSG="🚀 STANDARD MODE: Maximum velocity."
fi

# Dispatch
case "$ACTION" in
    pull) do_pull ;;
    push) do_push ;;
    audit) run_orphan_audit ;;
    *) show_help ;;
esac