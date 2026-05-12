# PulsePoll

PulsePoll is a hackathon-ready real-time polling app with a TanStack Start frontend and an Express/MongoDB backend.

## Project Structure

- `client/` - frontend app, routes, UI, and API client
- `server/` - backend API, auth, polling logic, analytics, and Socket.IO

## Prerequisites

- Node.js 18 or newer
- MongoDB connection string

## Setup

Install dependencies in both apps:

```bash
cd server
npm install

cd ../client
npm install
```

Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env` with a real `MONGODB_URI`, a strong `JWT_SECRET`, and the frontend origin in `CLIENT_URL`.

## Development

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

The frontend defaults to `http://localhost:5173` and calls `VITE_API_URL`, which defaults to `http://localhost:5000/api`.

## Production Checklist

- Set `NODE_ENV=production`.
- Use a strong `JWT_SECRET` with at least 32 characters.
- Set `CLIENT_URL` to the deployed frontend origin, for example `https://polls.example.com`.
- Set `COOKIE_SECURE=true` in production.
- If frontend and backend are on different sites, use `COOKIE_SAME_SITE=none` with HTTPS.
- Set `TRUST_PROXY=true` only when running behind a trusted proxy or platform load balancer.
- Run `npm run build` in `client` before deploying the frontend.
- Run `npm start` in `server` for the backend process.

## Verification

```bash
cd client
npm run lint
npm run build

cd ../server
npm start
```
