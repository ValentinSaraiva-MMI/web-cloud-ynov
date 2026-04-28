import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import "./firebaseConfig";

const auth = getAuth();

export const signup = (email, password) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      console.log(user);
      console.log("signup success");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
    });
};
