import app from "../firebaseConfig";
import { getFirestore } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

const db = getFirestore(app, "bddvalentin");

export const getPostData = async () => {
  const querySnapshot = await getDocs(collection(db, "posts"));
  let res = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return res;
};
