import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase} from "firebase/database";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyATz649k7KDIlL3Fki6x84XiGkOxs54Po4",
  authDomain: "seznamka-vyvoj.firebaseapp.com",
  projectId: "seznamka-vyvoj",
  storageBucket: "seznamka-vyvoj.appspot.com",
  messagingSenderId: "1055702192666",
  appId: "1:1055702192666:web:ebc72902e7c4782da737a3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);


export { app, auth, db, storage };