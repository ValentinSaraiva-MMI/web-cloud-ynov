import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import "../firebaseConfig";

const auth = getAuth();

export const signup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
