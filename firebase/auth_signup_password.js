import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import "../firebaseConfig";

const auth = getAuth();

export const signup = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  if (name) {
    await updateProfile(userCredential.user, { displayName: name });
  }
  return userCredential;
};
