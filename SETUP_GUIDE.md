# Cloudinary Setup Guide

## You need to provide your Cloudinary Cloud Name

The upload preset `Iuc6JmkTiFBbhInGjCihOS3tzmM` is configured, but we need your **Cloud Name** to make it work.

## How to find your Cloudinary credentials:

1. Go to https://cloudinary.com and login to your account
2. Go to the Dashboard
3. You'll see your credentials:
   - **Cloud Name** (e.g., "dxxxxx" or "my-cloud-name")
   - **API Key** (e.g., "123456789012345")
   - **API Secret** (keep this private!)

## Update your .env file:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name_here
VITE_CLOUDINARY_API_KEY=your_api_key_here (optional for unsigned uploads)
VITE_CLOUDINARY_API_SECRET=your_api_secret_here (optional for unsigned uploads)
VITE_CLOUDINARY_UPLOAD_PRESET=Iuc6JmkTiFBbhInGjCihOS3tzmM
```

## Configure Upload Preset for Private Uploads:

1. In Cloudinary Dashboard, go to **Settings** > **Upload**
2. Find your upload preset: `Iuc6JmkTiFBbhInGjCihOS3tzmM`
3. Edit the preset and set:
   - **Signing Mode**: Unsigned (for easier uploads) or Signed (more secure)
   - **Delivery Type**: Private
   - **Access Mode**: Authenticated (optional, for extra security)
4. Save the preset

## After updating .env:

1. Restart the dev server (Ctrl+C and run `npm run dev` again)
2. The app should now work properly!

## Current Error:

The error "Unknown API key" means the Cloud Name is not set correctly. Once you add your actual cloud name to the .env file, uploads will work.
