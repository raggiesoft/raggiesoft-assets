#cloud-config
# replace these with the correct SSH keys
users:
  - name: michael
    groups: sudo
    shell: /bin/bash
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    ssh_authorized_keys:
      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFbI2in/zZldj7MeeCqnYItZzGX8AEEi6FAvmTWbJnF0 michael@windows-desktop

# Disable root SSH login immediately
disable_root: true

# Update the OS on first boot
package_update: true
package_upgrade: true

# Inject the Nginx Configuration File directly
write_files:
  - path: /etc/nginx/sites-available/raggiesoft.com.conf
    owner: root:root
    permissions: '0644'
    content: |
      server {
          server_name raggiesoft.com www.raggiesoft.com;
          root /var/www/raggiesoft.com;

          # LOGS
          access_log /var/log/nginx/raggiesoft_access.log;
          error_log /var/log/nginx/raggiesoft_error.log;

          # PRIORITY 1: The Custom Router
          index amanda/elara.php;

          # Security: Prevent viewing dotfiles
          location ~ /\. {
              deny all;
          }

          # >>> STARDUST ENGINE: APP LOGIC GATEWAY <<<
          # 1. ALLOW: Game Logic & Apps
          location ^~ /includes/components/apps/ {
              try_files $uri $uri/ =404;

              location ~ \.php$ {
                  include snippets/fastcgi-php.conf;
                  fastcgi_pass unix:/var/run/php/php8.5-fpm.sock;
                  fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                  include fastcgi_params;
              }
          }

          # 2. DENY: Internal Components
          location ^~ /includes/ {
              deny all;
              return 404;
          }

          # >>> HOTLINK PROTECTION (Crawler Friendly) <<<
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

          # MAIN LOCATION BLOCK
          location / {
              try_files $uri $uri/ /amanda/elara.php?$query_string;
          }

          # PHP PROCESSING (Global)
          location ~ \.php$ {
              include snippets/fastcgi-php.conf;
              fastcgi_pass unix:/var/run/php/php8.5-fpm.sock;
              fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
              include fastcgi_params;
          }

          # CUSTOM ERROR PAGES
          error_page 403 /amanda/errors/403.php;
          error_page 404 /amanda/errors/404.php;
          error_page 500 /amanda/errors/500.php;
          error_page 502 /amanda/errors/502.php;
          error_page 503 /amanda/errors/503.php;
          error_page 504 /amanda/errors/504.php;

          location ^~ /amanda/errors/ {
              internal; 
          }

          # SSL CONFIGURATION (Cloudflare Origin CA)
          listen 443 ssl; 
          ssl_certificate /etc/nginx/ssl/raggiesoft.pem; 
          ssl_certificate_key /etc/nginx/ssl/raggiesoft.key; 
          ssl_protocols TLSv1.2 TLSv1.3;
          ssl_ciphers HIGH:!aNULL:!MD5;
      }

      # HTTP REDIRECT BLOCK
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

# Execute the provisioning sequence automatically
runcmd:
  # 1. Add the PHP repository
  - add-apt-repository -y ppa:ondrej/php
  - apt-get update -y
  
  # 2. Install Core Software (No DB bloat)
  - apt-get install -y nginx php8.5-fpm php8.5-cli php8.5-common php8.5-xml php8.5-curl php8.5-mbstring php8.5-zip unzip curl git jq ufw
  
  # 3. Configure the UFW Firewall
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow OpenSSH
  - ufw allow "Nginx Full"
  - ufw --force enable
  
  # 4. Set up the Web Directory Structure & Gateway File
  - mkdir -p /var/www/raggiesoft.com/amanda/errors
  - chown -R michael:michael /var/www/raggiesoft.com
  - chmod -R 755 /var/www/raggiesoft.com
  - echo "<?php echo 'Elara Gateway 5.7 Initialized. Awaiting Sarah deployment.'; ?>" > /var/www/raggiesoft.com/amanda/elara.php
  
  # 5. Create SSL Directory and Temporary Certs (Prevents Nginx crash on boot)
  - mkdir -p /etc/nginx/ssl
  - openssl req -x509 -nodes -days 30 -newkey rsa:2048 -keyout /etc/nginx/ssl/raggiesoft.key -out /etc/nginx/ssl/raggiesoft.pem -subj "/CN=raggiesoft.com"
  
  # 6. Activate the Nginx Configuration
  - rm -f /etc/nginx/sites-enabled/default
  - ln -s /etc/nginx/sites-available/raggiesoft.com.conf /etc/nginx/sites-enabled/
  
  # 7. Optimize and Restart Services
  - systemctl restart php8.5-fpm
  - systemctl enable php8.5-fpm
  - systemctl restart nginx
  - systemctl enable nginx