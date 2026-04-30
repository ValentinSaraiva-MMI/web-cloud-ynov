import { getAuth, signInWithPopup } from "firebase/auth";
import { provider } from "./auth_google_provider_create";
import "../firebaseConfig";

const auth = getAuth();

export const signinWithGoogle = () => {
  return signInWithPopup(auth, provider);
};
