import { getAuth, signInWithPopup } from "firebase/auth";
import { provider } from "./auth_github_provider_create";

const auth = getAuth();

export const signinWithGithub = () => {
  return signInWithPopup(auth, provider);
};
