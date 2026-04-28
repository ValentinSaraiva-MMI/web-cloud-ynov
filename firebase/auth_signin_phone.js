import { getAuth, signInWithPhoneNumber } from "firebase/auth";
import "../firebaseConfig";

const auth = getAuth();

export const sendSmsCode = (phoneNumber, appVerifier) => {
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

export const verifySmsCode = (confirmationResult, code) => {
  return confirmationResult.confirm(code);
};
