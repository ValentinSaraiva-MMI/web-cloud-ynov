import { getAuth, updateProfile } from "firebase/auth";
import "../firebaseConfig";

const auth = getAuth();

export const updateUserProfile = (displayName, photoURL) => {
  return updateProfile(auth.currentUser, { displayName, photoURL });
};
