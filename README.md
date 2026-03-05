# Media Gallery App

A modern, production-ready React application for managing and viewing media files with Cloudinary integration.

## Features

- 🔐 Session-based authentication (password: `Spidy@123`)
- 📤 Bulk upload support for images and videos
- 📦 ZIP file upload with password protection
- 🖼️ Image and video filtering with pagination
- 📋 Grid and List view modes
- 🔍 Advanced media viewer with:
  - Zoom in/out
  - Pan and drag
  - Rotation
  - Video playback controls (play, pause, speed, loop)
  - Next/Previous navigation
- 🗑️ Individual and bulk delete functionality
- 🔄 Refresh to sync with Cloudinary
- 🎨 Modern dark theme with Tailwind CSS
- 📱 Fully responsive design
- ✨ Smooth animations with Framer Motion
- ☁️ Cloudinary integration for media storage

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3. Run Development Server
```bash
npm run dev
```

This starts both frontend (port 3000) and backend (port 3001).

Visit: http://localhost:3000

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push
```

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variables in project settings
4. Deploy!

### 3. Environment Variables in Vercel
Add these in Vercel dashboard (Settings → Environment Variables):
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_API_KEY`
- `VITE_CLOUDINARY_API_SECRET`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

Select all environments (Production, Preview, Development).

## Project Structure

```
├── api/
│   └── index.js           # Serverless API for Vercel
├── src/
│   ├── components/        # React components
│   ├── services/          # API services
│   ├── store/            # State management (Zustand)
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── server.js             # Local development server
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Zustand (state management)
- Cloudinary
- JSZip
- Express (backend)
- Lucide React (icons)

## Scripts

- `npm run dev` - Start both frontend and backend
- `npm run client` - Start frontend only
- `npm run server` - Start backend only
- `npm run build` - Build for production

## Features Guide

### Authentication
- Default password: `Spidy@123`
- Session-based (requires login after browser restart)
- Change password in `src/store/authStore.js`

### Upload
- Supports images (JPG, PNG, GIF, WebP)
- Supports videos (MP4, MOV, AVI, MKV)
- Bulk upload multiple files
- ZIP file upload with password protection
- All uploads stored privately in Cloudinary

### View Modes
- **Grid View**: Thumbnail grid with hover effects
- **List View**: Detailed list with file info

### Media Viewer
- Full-screen preview
- Zoom and pan for images
- Video controls (play, pause, speed, loop, volume)
- Navigate between media with arrow keys
- Delete from viewer

### Filters
- All media
- Images only
- Videos only

## License

MIT
