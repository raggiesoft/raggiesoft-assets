#cloud-config
# --- CLAIRE: INFRASTRUCTURE ARCHITECT ---

# 1. THE GUEST LIST
users:
  - name: michael
    groups: sudo
    shell: /bin/bash
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    ssh_authorized_keys:
      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFbI2in/zZldj7MeeCqnYItZzGX8AEEi6FAvmTWbJnF0 michael@windows-desktop-tower
      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICBTirNBbMwmqi6bnlz0PCQMYBb0NRDH/rqMVvjuCEqG M2 MacBook Air
      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHUAlAKsdD9d1tT4dmYt8gSqyErOYiEMpbM3zDVTjSZg michael@hp-laptop

disable_root: true

# 2. HOUSEKEEPING
package_update: true
package_upgrade: false

# 3. FILE INJECTION (The Blueprints)
write_files:
  # -> NGINX GATEWAY
  - path: /etc/nginx/sites-available/raggiesoft.com.conf
    owner: root:root
    permissions: '0644'
    content: |
      server {
          server_name raggiesoft.com www.raggiesoft.com;
          root /var/www/raggiesoft.com;

          access_log /var/log/nginx/raggiesoft_access.log;
          error_log /var/log/nginx/raggiesoft_error.log;

          index amanda/elara.php;

          location ~ /\. {
              deny all;
          }

          location ^~ /includes/components/apps/ {
              try_files $uri $uri/ =404;
              location ~ \.php$ {
                  include snippets/fastcgi-php.conf;
                  fastcgi_pass unix:/var/run/php/php8.5-fpm.sock;
                  fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                  include fastcgi_params;
              }
          }

          location ^~ /includes/ {
              deny all;
              return 404;
          }

          location ~* \.(gif|png|jpe?g|svg|webp|ico)$ {
              valid_referers none blocked server_names 
                             *.raggiesoft.com raggiesoft.com 
                             *.engineroom-records.com engineroom-records.com
                             ~*\.google\. ~*\.bing\. ~*\.yahoo\. ~*\.duckduckgo\. ~*\.yandex\.
                             ~*\.ask\. ~*\.lycos\. ~*\.altavista\.;
              if ($invalid_referer) {
                  return 302 https://assets.raggiesoft.com/common/images/no-hotlink.jpg;
              }
              expires 30d;
              add_header Cache-Control "public, no-transform";
              try_files $uri $uri/ =404;
          }

          location / {
              try_files $uri $uri/ /amanda/elara.php?$query_string;
          }

          location ~ \.php$ {
              include snippets/fastcgi-php.conf;
              fastcgi_pass unix:/var/run/php/php8.5-fpm.sock;
              fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
              include fastcgi_params;
          }

          error_page 403 /amanda/errors/403.php;
          error_page 404 /amanda/errors/404.php;
          error_page 500 /amanda/errors/500.php;
          error_page 502 /amanda/errors/502.php;
          error_page 503 /amanda/errors/503.php;
          error_page 504 /amanda/errors/504.php;

          location ^~ /amanda/errors/ {
              internal; 
          }

          listen 443 ssl; 
          ssl_certificate /etc/nginx/ssl/raggiesoft.pem; 
          ssl_certificate_key /etc/nginx/ssl/raggiesoft.key; 
          ssl_protocols TLSv1.2 TLSv1.3;
          ssl_ciphers HIGH:!aNULL:!MD5;
      }

      server {
          if ($host = www.raggiesoft.com) {
              return 301 https://$host$request_uri;
          } 
          if ($host = raggiesoft.com) {
              return 301 https://$host$request_uri;
          } 
          listen 80;
          server_name raggiesoft.com www.raggiesoft.com;
          return 404; 
      }

  # -> SARAH'S DEPLOYMENT SCRIPT (Staging Area)
  - path: /opt/sarah-deploy.sh
    owner: root:root
    permissions: '0755'
    content: |
      #!/bin/bash
      
      # --- SARAH: AUTONOMOUS DEPLOYMENT (v4.1 - Systemd Edition) ---
      
      # 0. ROOT PRIVILEGE CHECK
      if [ "$EUID" -eq 0 ]; then
          echo "[!] SARAH: WHAT ARE YOU DOING?! I explicitly told you I do not need root!"
          echo "    ABORTING: Drop the sudo and let me do my job."
          exit 1
      fi
      
      # 1. CONFIGURATION
      REPO_DIR="/home/michael/raggiesoft-hub"
      WEB_ROOT="/var/www/raggiesoft.com"
      
      # 2. THE INTELLIGENCE CHECK (Detect Changes)
      cd "$REPO_DIR" || exit
      git fetch origin main
      
      LOCAL=$(git rev-parse HEAD)
      REMOTE=$(git rev-parse origin/main)
      
      if [ "$LOCAL" == "$REMOTE" ]; then
          exit 0
      fi
      
      # 3. CHANGES DETECTED
      echo "[i] SARAH: Change detected! Jenna pushed updates."
      echo "    Previous: $LOCAL"
      echo "    New:      $REMOTE"
      git reset --hard origin/main
      
      # 4. DEPLOY (Standard User Mode - No Sudo)
      echo "[i] SARAH: Syncing files to Showroom..."
      rsync -av --delete --no-o --no-g \
          --exclude '.git' \
          --exclude '.gitignore' \
          --exclude 'deploy.sh' \
          --exclude 'README.md' \
          "$REPO_DIR/" "$WEB_ROOT/"
      
      # 5. PERMISSIONS (Self-Correction)
      echo "[i] SARAH: Standardizing file permissions..."
      find "$WEB_ROOT" -type d -exec chmod 755 {} +
      find "$WEB_ROOT" -type f -exec chmod 644 {} +
      
      echo "[*] SARAH: Deployment Complete at $(date)"

  # -> SARAH'S SYSTEMD SERVICE
  - path: /etc/systemd/system/sarah.service
    owner: root:root
    permissions: '0644'
    content: |
      [Unit]
      Description=Sarah Autonomous Deployment Service
      After=network.target

      [Service]
      Type=oneshot
      User=michael
      Group=michael
      ExecStart=/home/michael/sarah-deploy.sh

  # -> SARAH'S SYSTEMD TIMER
  - path: /etc/systemd/system/sarah.timer
    owner: root:root
    permissions: '0644'
    content: |
      [Unit]
      Description=Run Sarah Deployment Script every 5 minutes

      [Timer]
      OnBootSec=5min
      OnUnitActiveSec=5min
      AccuracySec=1s

      [Install]
      WantedBy=timers.target

# 4. EXECUTION SEQUENCE
runcmd:
  # 1. Install Core Software 
  # "Ubuntu 26.04 ships with PHP 8.5 natively, so I'm bypassing the PPA."
  - apt-get update -y
  - apt-get install -y nginx php-fpm php-cli php-common php-xml php-curl php-mbstring php-zip unzip curl git jq ufw
  
  # 2. Configure the UFW Firewall
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow OpenSSH
  - ufw allow "Nginx Full"
  - ufw --force enable
  
  # 3. Set up the Web Directory Structure & Gateway File
  - mkdir -p /var/www/raggiesoft.com/amanda/errors
  - chown -R michael:michael /var/www/raggiesoft.com
  - chmod -R 755 /var/www/raggiesoft.com
  - echo "<?php echo 'Elara Gateway 5.7 Initialized. Awaiting Sarah deployment.'; ?>" > /var/www/raggiesoft.com/amanda/elara.php
  
  # 4. Create SSL Directory and Temporary Certs
  - mkdir -p /etc/nginx/ssl
  - openssl req -x509 -nodes -days 30 -newkey rsa:2048 -keyout /etc/nginx/ssl/raggiesoft.key -out /etc/nginx/ssl/raggiesoft.pem -subj "/CN=raggiesoft.com"
  
  # 5. Activate the Nginx Configuration
  - rm -f /etc/nginx/sites-enabled/default
  - ln -s /etc/nginx/sites-available/raggiesoft.com.conf /etc/nginx/sites-enabled/
  
  # 6. Activate Sarah's Systemd Timer
  - systemctl daemon-reload
  - systemctl enable sarah.timer
  - systemctl start sarah.timer
  
  # 7. Optimize and Restart Services
  - systemctl restart php8.5-fpm
  - systemctl enable php8.5-fpm
  - systemctl restart nginx
  - systemctl enable nginx

  # 8. CLONE THE REPOSITORY (The Hand-off)
  - sudo -u michael git clone https://github.com/raggiesoft/raggiesoft-hub.git /home/michael/raggiesoft-hub

  # 9. WAKE SARAH UP 
  - systemctl start sarah.service