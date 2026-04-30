import { getAuth, signOut } from "firebase/auth";
import "../firebaseConfig";

const auth = getAuth();

export const signout = () => {
  return signOut(auth);
};
