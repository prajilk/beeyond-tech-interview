#!/bin/bash

set -e  # Exit if any command fails

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use node

echo "🔁 Pulling latest changes..."
git pull origin master

echo "📦 Installing frontend deps..."
npm install

echo "🛠 Building Next.js app..."
npm run build

echo "📦 Installing backend deps..."
cd server
npm install
cd ..

echo "🚀 Restarting app with PM2..."
pm2 restart all || pm2 start npm --name beeyond -- start