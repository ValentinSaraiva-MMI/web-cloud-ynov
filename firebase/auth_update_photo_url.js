import app from "../firebaseConfig";
import { getAuth, updateProfile } from "firebase/auth";

const auth = getAuth(app);

export const updateUserPhotoUrl = async (downloardUrl) => {
  try {
    await updateProfile(auth.currentUser, { photoURL: downloardUrl });
    return true;
  } catch (e) {
    return false;
  }
};
