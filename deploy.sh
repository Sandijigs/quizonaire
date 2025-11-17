#!/bin/bash

# --- Конфигурация ---
# Завершить выполнение скрипта, если любая команда завершится с ошибкой
set -e

# Пути к директориям для удобства
PROJECT_DIR="/root/Projects/somnia_relay_viewer"
DEST_DIR="/var/www/somniapresentor"

# --- Начало выполнения ---
echo "🚀 Starting deployment script..."

# 1. Переходим в директорию проекта
cd "$PROJECT_DIR"
echo "✅ Changed directory to $PROJECT_DIR"

# 2. Вытягиваем последние изменения из Git
echo "🔄 Pulling latest changes from Git..."
git pull

# 3. Устанавливаем/обновляем зависимости
echo "📦 Installing npm dependencies..."
npm install

# 4. Загружаем переменные окружения из .env файла
echo "🔒 Loading environment variables from .env file..."
if [ -f .env ]; then
    source .env
else
    echo "🚨 Error: .env file not found!"
    exit 1
fi

# 5. Собираем проект
echo "🛠️ Building the project..."
npm run build

# 6. Удаляем старую сборку с сервера
echo "🗑️ Deleting old build from $DEST_DIR..."
# Проверяем, существует ли директория перед удалением
if [ -d "$DEST_DIR/dist" ]; then
    rm -rf "$DEST_DIR/dist"
    echo "✅ Old dist directory removed."
else
    echo "ℹ️ No old dist directory to remove."
fi

# 7. Копируем новую сборку на сервер
echo "🚚 Copying new build to $DEST_DIR..."
cp -r "$PROJECT_DIR/dist" "$DEST_DIR/"
echo "✅ New build copied successfully."

# 8. Проверяем конфигурацию Nginx и перезагружаем его
echo "⚙️ Checking Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid. Reloading Nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded."
else
    echo "🚨 Nginx configuration test failed! Not reloading."
    exit 1
fi

echo "🎉 Deployment finished successfully!"