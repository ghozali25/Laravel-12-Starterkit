# 🚀 Laravel 12 + React Starter Kit

A modern and flexible starter kit built with **Laravel 12**, **React (Inertia.js + TypeScript)**, **TailwindCSS**, and **ShadCN UI v4**. Designed to accelerate secure, responsive, and customizable dashboard application development.

---

## ✨ Features

- 🔐 Full authentication (login, register, reset password)
- 👥 Role & Permission Management (Spatie Laravel Permission)
- 📂 Dynamic Sidebar & Menus based on role & permission
- 🧩 Drag & drop menu management (nested, reorder)
- ⚙️ App settings (name, logo, theme color, SEO)
- 🎨 ShadCN UI v4 + TailwindCSS modern design
- 🌗 Dark/Light mode support
- 🔒 Dynamic access protection via `CheckMenuPermission` middleware
- ⚠️ Custom 403 Error Page (React-based)
- 💾 Primary color configuration via DB `--primary`
- 🪪 Audit Log to track user activity
- 📦 Manual & automatic database backup system
- 🗂️ File Manager with folder & file operations

---

## 🧱 Tech Stack

| Area        | Technology                         |
| ----------- | ---------------------------------- |
| Backend     | Laravel 12                         |
| Frontend    | React 19 + Inertia.js + TypeScript |
| UI Library  | ShadCN UI v4                       |
| CSS Utility | TailwindCSS                        |
| Auth        | Laravel Fortify / Breeze-style     |
| Access Ctrl | Spatie Laravel Permission v5       |
| DBMS        | MySQL / MariaDB                    |
| Layout      | Dynamic Sidebar + Header           |

---

## 🔧 Installation & Setup

```bash
# Create project
composer create-project ghozali25/Laravel-12-Starterkit my-app
cd my-app

# Backend setup
composer install

# Copy .env
cp .env.example .env

# Generate Key
php artisan key:generate

# Configure your database settings in .env
php artisan migrate:fresh --seed

# Frontend setup
npm install

# Running dev
composer run dev
```

Login using:

```
Email: admin@admin.com
Password: admin123
```

---

## 🚀 Deployment Guide

1. **Build Frontend for Production**

```bash
npm install
npm run build
```

2. **Run Laravel in Production Mode**

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

3. **Set File Permissions**

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data .
```

4. **Serve with Web Server** (Nginx/Apache) pointing to `public/` folder.

---

## ✅ Manual Test Checklist

| Feature                  | Status |
| ------------------------ | ------ |
| Dashboard drag, resize   | ✅     |
| Dashboard add widget     | ✅     |
| Authentication (Login)   | ✅     |
| CRUD User                | ✅     |
| CRUD Role & Permission   | ✅     |
| Dynamic Menu + Sidebar   | ✅     |
| Division                 | ✅     |
| Role Manager & Leader    | ✅     |
| Access Protection (403)  | ✅     |
| Drag & Drop Menu Sorting | ✅     |
| Theme Color via DB       | ✅     |
| Dark Mode Support        | ✅     |
| Audit Logs Functionality | ✅     |
| Database Backup          | ✅     |
| File Manager             | ✅     |

---

## 📄 License

Released under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use it for personal or commercial projects.

---

Created with ❤️ by [@ghozali25](https://github.com/ghozali25)