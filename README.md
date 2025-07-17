Вот улучшенная, структурированная и современная документация по деплою и запуску вашего проекта (backend + frontend + nginx + pm2 + переменные окружения):

---

# Инструкция по развертыванию проекта

## 1. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Установка Node.js (через nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install --lts
nvm use --lts
```

## 3. Установка Git

```bash
sudo apt install git -y
```

## 4. Установка PM2 (процесс-менеджер для Node.js)

```bash
sudo npm install -g pm2
```

## 5. Установка и настройка Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 6. Клонирование репозиториев

```bash
cd /var/www
git clone git@github.com:john252525/be_pay.git
git clone git@github.com:john252525/be_chat.git
git clone git@github.com:john252525/frontend_vue.git
```

## 7. Настройка переменных окружения

### Пример `.env` для **be_chat**:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_db_password
MYSQL_PORT=3306

API_URL=https://b2288.apitter.com/instances
```

### Пример `.env` для **be_pay**:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_db_password
MYSQL_DATABASE=payments
MYSQL_PORT=3306

SHOP_ID=your_shop_id
SECRET_KEY=your_secret_key
RETURN_URL=https://your-return-url.com
```

### Пример `.env` для **frontend_vue** (файл `.env`):

```
VITE_API_URL=https://api28.developtech.ru/api
VITE_API_URL=https://api28.developtech.ru/api
VITE_PAY_URL=https://api22.developtech.ru/api
VITE_API_CHECK_BE_CHAT = https://api28.developtech.ru/api
VITE_WHATSAPI_URL = https://whatsapi.ru/ru/api/autosend/whatsapp
VITE_GOOGLE_AUTH_URL = https://api28.be-auth.developtech.ru
VITE_FRONTEND_URL = https://bapi88.developtech.ru/api/v1/

```

### Пример `.env` для **be_auth** (Google OAuth):

```
CLIENT_ID=your_google_client_id
```

## 8. Установка зависимостей

```bash
cd /var/www/be_pay
npm install

cd /var/www/be_chat
npm install

cd /var/www/frontend_vue
npm install
npm run build
```

## 9. Запуск приложений через PM2

```bash
cd /var/www/be_pay
pm2 start server.js --name "be_pay"

cd /var/www/be_chat
pm2 start server.js --name "be_chat"
```

## 10. Сохранение и автозапуск процессов PM2

```bash
pm2 save
pm2 startup systemd
```

## 11. Настройка Nginx

Создайте файл `/etc/nginx/conf.d/project.conf`:

```nginx
server {
    listen 80;
    server_name helly.apitter.com;

    root /var/www/frontend_vue/dist;
    index index.html index.htm;

    error_log /var/log/nginx/frontend_vue-error.log;
    access_log /var/log/nginx/frontend_vue-access.log;
}

server {
    listen 80;
    server_name hellylo.apitter.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    error_log /var/log/nginx/backend-error.log;
    access_log /var/log/nginx/backend-access.log;
}

server {
    listen 80;
    server_name hellychat.apitter.com;

    location / {
        client_max_body_size 50M;
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_read_timeout 3600;
    }

    location /api/webhook {
        client_max_body_size 50M;
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /phpmyadmin {
        root /usr/share/;
        index index.php index.html index.htm;

        location ~ ^/phpmyadmin/(doc|sql|setup)/ {
            deny all;
        }

        location ~ /phpmyadmin/(.*\.php)$ {
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        }
    }

    error_log /var/log/nginx/backend_chats-error.log;
    access_log /var/log/nginx/backend_chats-access.log;
}
```

Перезапустите nginx:

```bash
sudo systemctl restart nginx
```

## 12. Управление проектом

- Посмотреть процессы: `pm2 list`
- Запустить процесс: `pm2 start <имя>`
- Логи процесса: `pm2 logs <имя>`
- Перезапустить процесс: `pm2 restart <имя>`
- Перезапустить nginx: `sudo systemctl restart nginx`

---

## 13. Google OAuth (be_auth)

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/).
2. Создайте проект.
3. Включите нужные API (OAuth, Gmail и т.д.).
4. Настройте экран согласия OAuth.
5. Создайте OAuth 2.0 Client ID:
   - Укажите тип приложения (Web/Desktop).
   - Пропишите Redirect URI:  
     ```
     https://be-auth.developtech.ru/api/auth/google/callback
     ```
   - Сохраните Client ID и Client Secret.
6. Укажите нужные домены в настройках экрана согласия.
