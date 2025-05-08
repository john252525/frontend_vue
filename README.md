1. Обновляем пакеты системы
   sudo apt update && sudo apt upgrade -y

2. Устанавливаем node js
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.nvm/nvm.sh
   nvm install --lts
   nvm use --lts

3. Установка git
   sudo apt install git -y

///// sudo apt install npm -y

4. Установка pm2
   sudo npm install -g pm2

5. Устанавливаем nginx
   sudo apt install nginx -y

6. Запустить nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx

///// /usr/lib/systemd/systemd-sysv-install enable nginx

///// mkdir /var/www

7. Переходим в cd /var/www

8. Клонируем репозитории
   git clone git@github.com:john252525/be_pay.git
   git clone git@github.com:john252525/be_chat.git
   git clone git@github.com:john252525/frontend_vue.git

9. Настройка .env

be_chat:

MYSQL_HOST=localhost #ваш хост db
MYSQL_USER=root #вашe имя пользователя db
MYSQL_PASSWORD=68b329da9893e34099c7 #ваш пароль db
MYSQL_PORT=3306 #ваш порт db

API_URL=https://b2288.apitter.com/instances #ваш url api

be_pay:

MYSQL_HOST=localhost #ваш хост db
MYSQL_USER=root #вашe имя пользователя db
MYSQL_PASSWORD=68b329da9893e34099c7 #ваш пароль db
MYSQL_DATABASE=payments #имя db к которой подключаемся (лучше не трогать)
MYSQL_PORT=3306 # по умолчанию 3306 #ваш порт db

#ю касса

SHOP_ID=437408 #id магазига
SECRET_KEY=test_xB5ui4r1OPr3Sc-WZ-dMgcre2uRzjZ2tFbuoM276wTs #ключ
RETURN_URL=https://your-return-url.com # ссылка редирект после платежа

frontend_vue

VITE_API_URL=https://api28.developtech.ru/api #Ссылка api чатов
VITE_PAY_URL=https://api22.developtech.ru/api #Ссылка api платежей
VITE_API_CHECK_BE_CHAT = https://api28.developtech.ru/api #Ссылка для проверки api чатов  
VITE_WHATSAPI_URL = https://whatsapi.ru/ru/api/autosend/whatsapp #Ссылка api рассылок
VITE_GOOGLE_AUTH_URL = https://api28.be-auth.developtech.ru #Ссылка api google auth

VITE_TITLE = WhatsApi #Заголовок страницы
VITE_TITLE_LOGO = WhatsApi #Заголовок навигации
VITE_URL_LOGO = /whats_api.svg #Ссылка на лого

be_auth

CLIENT_ID = 536063598199-18bggcm8gcrsf1o92jejfkfmktt73c9g.apps.googleusercontent.com

10.Установка зависимостей

cd /var/www/be_pay
sudo npm install

cd /var/www/be_chat
sudo npm install

cd /var/www/frontend_vue
sudo npm install
npm run build

11. Настройка запуска приложений через PM2

cd /var/www/be_pay
pm2 start server.js --name "be_pay"

cd /var/www/be_chat
pm2 start server.js --name "be_chat"

12. Сохраняем процессы
    pm2 save
    pm2 startup systemd

13.Переходим к конфигу nginx
sudo nano /etc/nginx/conf.d/project.conf
если его нет, то создаем

14.server {
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

15. Управление проектом

pm2 list - покажет нам все процессы
pm2 start имя*сервиса - запустит определенный процесс
pm2 logs имя*сервиса - покажет логи процесса
pm2 restart имя_сервиса - перезапустит процесс

sudo systemctl restart nginx перезапустит nginx

Создание аккаунта для авторизации по Google

1 Перейдите в Google Cloud Console.
2 Нажмите "Создать проект", введите название и нажмите "Создать".
3 В меню слева выберите "API и сервисы" → "Библиотека API".
4 Найдите и включите: 3. Настройка экрана согласия OAuth
4 В меню "API и сервисы" → "Экран согласия OAuth".
5 Выберите тип пользователей (Внешний или Внутренний).
6 Заполните:
Название приложения
Email разработчика
Домены приложения (если есть)
7 Сохраните.

8 Создайте OAuth 2.0 Client ID
9 В меню "API и сервисы" → "Учетные данные".
10 Нажмите "Создать учетные данные" → "OAuth client ID".
11 Выберите тип приложения:
Веб-приложение (если серверный бэкенд)
Desktop (если десктопное)
12 Укажите Authorized JavaScript Origins и Authorized Redirect URIs (https://be-auth.developtech.ru/api/auth/google/callback).
13 Нажмите "Создать".
14 Получите Client ID
После создания вы увидите:
Client ID
Client Secret

Изменения доменов:

1. Перейдите на сайт Google Cloud Console
2. Выберите Apis & Services
3. Выберите OAuth consent screen
4. Выберите Clients
5. Выбери ваш проект и укажите нужные домены
