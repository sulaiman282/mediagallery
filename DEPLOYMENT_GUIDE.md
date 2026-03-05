# Deployment Guide

## Local Development

### Single Command Start
Now you can start both frontend and backend with one command:

```bash
npm run dev
```

This will automatically start:
- Backend server on `http://localhost:3001`
- Frontend on `http://localhost:3000`

### Individual Commands (if needed)
```bash
npm run server  # Backend only
npm run client  # Frontend only
```

## Deploy to Vercel

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Create a Vercel account at https://vercel.com

### Step 1: Prepare Environment Variables

In your Vercel project dashboard, add these environment variables:

```
VITE_CLOUDINARY_CLOUD_NAME=dd6ko1lvd
VITE_CLOUDINARY_API_KEY=352276193961695
VITE_CLOUDINARY_API_SECRET=Iuc6JmkTiFBbhInGjCihOS3tzmM
VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
```

### Step 2: Deploy

#### Option A: Deploy via CLI
```bash
vercel
```

Follow the prompts:
- Set up and deploy? Yes
- Which scope? Select your account
- Link to existing project? No
- Project name? (press enter for default)
- Directory? ./
- Override settings? No

#### Option B: Deploy via GitHub
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables
5. Click "Deploy"

### Step 3: Configure Environment Variables in Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all the variables from your `.env` file
4. Make sure to add them for all environments (Production, Preview, Development)

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:
```bash
vercel --prod
```

## Vercel Configuration

The `vercel.json` file is already configured to:
- Build the frontend (Vite)
- Deploy the backend (Express server)
- Route API calls to `/api/*` to the backend
- Serve static files from the frontend

## Important Notes

### API Routes
- In production, the app uses relative paths (`/api/*`)
- In development, it uses `http://localhost:3001/api`
- This is automatically handled by the code

### Environment Variables
- All environment variables must be prefixed with `VITE_` to be accessible in the frontend
- Backend variables (without VITE_ prefix) are only accessible server-side
- Never commit `.env` file to git

### Build Process
1. Vercel runs `npm run build` (Vite build)
2. Deploys the `dist` folder as static files
3. Deploys `server.js` as a serverless function
4. Routes are configured in `vercel.json`

## Troubleshooting

### Build Fails
- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Verify environment variables are set correctly
- Check build logs in Vercel dashboard

### API Not Working
- Verify `vercel.json` routes are correct
- Check that environment variables are set for production
- Look at function logs in Vercel dashboard

### Frontend Not Loading
- Check that `dist` folder is being generated
- Verify `vite.config.js` is correct
- Check browser console for errors

## Alternative Deployment Options

### Netlify
1. Add `netlify.toml` configuration
2. Deploy via Netlify CLI or GitHub integration
3. Configure environment variables in Netlify dashboard

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Railway auto-detects Node.js and deploys

### Render
1. Create new Web Service
2. Connect repository
3. Set build command: `npm run build`
4. Set start command: `npm run server`
5. Add environment variables

## Production Checklist

- [ ] Environment variables configured
- [ ] `.env` file in `.gitignore`
- [ ] Cloudinary credentials are correct
- [ ] Upload preset is configured
- [ ] API routes are working
- [ ] Frontend builds successfully
- [ ] Test upload functionality
- [ ] Test delete functionality
- [ ] Test face detection (if enabled)
- [ ] Check mobile responsiveness
- [ ] Verify HTTPS is working

## Support

For issues:
1. Check Vercel deployment logs
2. Check browser console
3. Verify environment variables
4. Test API endpoints directly
