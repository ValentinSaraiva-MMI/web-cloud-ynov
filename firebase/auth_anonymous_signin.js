import { getAuth, signInAnonymously } from "firebase/auth";
import "../firebaseConfig";

const auth = getAuth();

export const signinAnonymously = () => {
  return signInAnonymously(auth);
};
