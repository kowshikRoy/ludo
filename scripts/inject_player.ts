const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, update } = require('firebase/database');

const envPath = path.resolve(process.cwd(), '.env.local');
let firebaseConfig = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line: string) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/"/g, ''); // Simple cleanup
      if (key) firebaseConfig[key] = val;
    }
  });
} catch (e) {
  console.error("Could not read .env.local", e);
}

const config = {
  apiKey: firebaseConfig['NEXT_PUBLIC_FIREBASE_API_KEY'],
  authDomain: firebaseConfig['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
  databaseURL: firebaseConfig['NEXT_PUBLIC_FIREBASE_DATABASE_URL'],
  projectId: firebaseConfig['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
  storageBucket: firebaseConfig['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: firebaseConfig['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
  appId: firebaseConfig['NEXT_PUBLIC_FIREBASE_APP_ID'],
  measurementId: firebaseConfig['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID']
};

const app = initializeApp(config);
const db = getDatabase(app);

const roomId = '-Oi-fn_uM8HSCodQzjm3';
const playerId = 'fake_player_' + Date.now();

console.log(`Injecting player into room: ${roomId}`);

const updates: any = {};
updates[`rooms/${roomId}/players/${playerId}`] = {
  name: 'Fake Player 2',
  color: 'green',
  ready: true
};

update(ref(db), updates).then(() => {
  console.log('Player injected successfully!');
  process.exit(0);
}).catch((err: any) => {
  console.error('Error injecting player:', err);
  process.exit(1);
});
