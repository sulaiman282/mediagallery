# Media Gallery App

A modern, production-ready React application for managing and viewing media files with Cloudinary integration.

## Features

- 🔐 Password-protected access (default: `Spidy@123`)
- 📤 Bulk upload support for images and videos
- 📦 ZIP file upload with password protection
- 🖼️ Image and video filtering with pagination
- 🔍 Advanced media viewer with:
  - Zoom in/out
  - Pan and drag
  - Rotation
  - Video playback controls (play, pause, speed, loop)
  - Next/Previous navigation
- 🎨 Modern dark theme with Tailwind CSS
- 📱 Fully responsive design
- ✨ Smooth animations with Framer Motion
- ☁️ Cloudinary integration for media storage

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Zustand (state management)
- Cloudinary
- JSZip
- Lucide React (icons)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cloudinary

1. Create a Cloudinary account at https://cloudinary.com
2. Get your credentials from the dashboard
3. Create an upload preset:
   - Go to Settings > Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set signing mode to "Unsigned"
   - Save the preset name

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## Usage

### Login
- Default password: `Spidy@123`
- Password is stored in `src/store/authStore.js`

### Upload Media
1. Click the "Upload" button
2. Select images, videos, or ZIP files
3. For password-protected ZIPs, enter the password
4. Click "Upload" to start

### View Media
- Click any media item to open the viewer
- Use toolbar controls for zoom, rotation, and reset
- For videos: play/pause, speed control, loop, volume
- Navigate with arrow keys or on-screen buttons

### Filter Media
- Use filter buttons to show all, images only, or videos only
- Pagination automatically adjusts based on filter

## Project Structure

```
src/
├── components/
│   ├── Login.jsx           # Authentication screen
│   ├── MediaGallery.jsx    # Main gallery view
│   ├── MediaGrid.jsx       # Grid layout for media items
│   ├── MediaViewer.jsx     # Full-screen media viewer
│   ├── UploadModal.jsx     # Upload interface
│   └── Pagination.jsx      # Pagination controls
├── services/
│   └── cloudinary.js       # Cloudinary API integration
├── store/
│   ├── authStore.js        # Authentication state
│   └── mediaStore.js       # Media state management
├── App.jsx                 # Root component
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## Customization

### Change Password
Edit `src/store/authStore.js`:
```javascript
const DEFAULT_PASSWORD = 'YourNewPassword';
```

### Adjust Pagination
Edit `src/store/mediaStore.js`:
```javascript
itemsPerPage: 12, // Change this value
```

### Modify Theme
Edit `tailwind.config.js` to customize colors and styles.

## Security Notes

- All uploads are set to "private" in Cloudinary
- Password is stored in localStorage (consider more secure options for production)
- API secrets should never be exposed in client-side code
- Use Cloudinary's signed uploads for production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
"# mediagallery" 
