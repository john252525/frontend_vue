1. Клонировать проект в вашу папку vps сервера
2. Установка зависимостей: npm install --production
3. Установка зависимости для работы с npm: npm i @vue/cli-service
4. Сборка проекта: npm run build
5. Установка папки: sudo nano /etc/nginx/sites-available/название-папки.conf
6. server {
   listen 5000;
   server_name localhost;
   root /место/где/находится/папка/сервера/dist;
   index.html index.htm;
   location / {
   try_files $uri $uri/ /index.html;
   }

   error_log /var/log/nginx/название-папки-error.log;
   access_log /var/log/nginx/название-папки-access.log;

}

7. sudo in -s /etc/nginx/sites-available/название-папки.conf/ets/nginx/sites-enabled/название-папки.conf
8. Команда для теста: sudo nginx -t
9. Перезапуск: sudo systemctl restart nginx
10. Проверка статуса: sudo systemctl status nginx
