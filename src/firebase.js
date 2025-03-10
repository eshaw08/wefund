// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8Aau-wCBsLVRG09y6rtKvnDpK8lmsWao",
  authDomain: "crowdfundingapp-wefund.firebaseapp.com",
  projectId: "crowdfundingapp-wefund",
  storageBucket: "crowdfundingapp-wefund.firebasestorage.app",
  messagingSenderId: "339579286631",
  appId: "1:339579286631:web:067482a361429a366990c2",
  measurementId: "G-3BTM31Z89T",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage };
export default app;