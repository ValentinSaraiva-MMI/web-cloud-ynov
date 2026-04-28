import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import "../firebaseConfig";

const auth = getAuth();

export const signin = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};
