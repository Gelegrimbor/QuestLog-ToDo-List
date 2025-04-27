import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCAlfl78R7jRbudOqMRbgYzfpLo1iJJ6Hc',
  authDomain: 'questlog-efae2.firebaseapp.com',
  projectId: 'questlog-efae2',
  storageBucket: 'questlog-efae2.appspot.com',
  messagingSenderId: '717808827893',
  appId: '1:717808827893:web:b151616f604636ab5674bc',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
