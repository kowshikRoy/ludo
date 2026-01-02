# Multiplayer Ludo Game

A realtime multiplayer Ludo game built with Next.js and Firebase.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Firebase Setup:
   - Create a project at [Firebase Console](https://console.firebase.google.com/).
   - Enable **Realtime Database** (Start in Test Mode).
   - Copy your web app configuration keys.
   - Create a file named `.env.local` in the root directory:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
     NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_db_url
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

3. Run locally:
   ```bash
   npm run dev
   ```

## Development

- `app/game/[id]/page.tsx`: Multiplayer game room.
- `app/local/page.tsx`: Single-screen local testing.
- `lib/gameLogic.ts`: Core rules.
