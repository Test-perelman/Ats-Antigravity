import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = getApps().length === 0 ? initializeApp({ provider: 'postgres' }) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
