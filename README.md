# Mood-Based-Music-Player

Monorepo with:
- `frontend/`: React + Vite app (face mood detection + songs UI)
- `backend/`: Express + MongoDB + ImageKit API

## 1. Local Setup

### Backend env
Copy `backend/.env.example` to `backend/.env` and fill values.

Required backend vars:
- `MONGO_URI`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`
- `CORS_ORIGINS` (comma-separated allowed frontend URLs)
- `PORT` (optional, default `3000`)

### Frontend env
Copy `frontend/.env.example` to `frontend/.env`.

Required frontend var:
- `VITE_API_URL` (example: `http://localhost:3000`)

### Run locally
Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## 2. Deploy on Render

This repo includes `render.yaml` with two services:
- `mood-music-backend` (Node web service)
- `mood-music-frontend` (static site)

### Steps
1. Push this repo to GitHub.
2. In Render, create a new Blueprint and connect the repo.
3. Render will detect `render.yaml` and create both services.
4. Set environment variables:
   - Backend service:
     - `MONGO_URI`
     - `IMAGEKIT_PUBLIC_KEY`
     - `IMAGEKIT_PRIVATE_KEY`
     - `IMAGEKIT_URL_ENDPOINT`
     - `CORS_ORIGINS` = `https://<your-frontend-render-domain>`
   - Frontend service:
     - `VITE_API_URL` = `https://<your-backend-render-domain>`
5. Deploy backend first, then redeploy frontend so Vite bakes the final API URL.

## 3. Post-Deploy Checks

- Open backend URL and verify it returns: `Backend is running properly.`
- Open frontend URL and run mood detection.
- Confirm backend logs show `GET /songs` with no CORS errors.

## 4. Notes

- `VITE_*` vars are public and bundled into frontend build. Never place private keys in frontend env.
- If songs are missing, verify song data exists in MongoDB and/or ImageKit folder structure matches mood folders (`audio-files/<mood>`).
