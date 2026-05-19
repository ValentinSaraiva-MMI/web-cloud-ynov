import app from "../firebaseConfig";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const db = getFirestore(app, "bddvalentin");

export const getCommentData = async (postId) => {
  const querySnapshot = await getDocs(collection(db, "posts", postId, "comments"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
