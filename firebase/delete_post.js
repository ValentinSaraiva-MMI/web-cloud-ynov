import app from "../firebaseConfig";
import { deleteDoc, doc, getFirestore } from "firebase/firestore";

const db = getFirestore(app, "bddvalentin");

export const deletePost = async (postId) => {
  await deleteDoc(doc(db, "posts", postId));
};
