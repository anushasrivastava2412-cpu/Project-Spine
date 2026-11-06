import { initializeApp } from 'firebase/app';
import { getAuth, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import config from './firebase-config.json';
export const app=initializeApp(config);
export const auth=getAuth(app);
export const db=getFirestore(app);
export const authReady=setPersistence(auth,browserSessionPersistence);
