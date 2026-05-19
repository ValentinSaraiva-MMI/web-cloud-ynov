import app from "../firebaseConfig";
import { addDoc, collection, getFirestore } from "firebase/firestore";

const db = getFirestore(app, "bddvalentin");

export const addComment = async (postId, text, createdBy) => {
  try {
    const docRef = await addDoc(collection(db, "posts", postId, "comments"), {
      text,
      createdBy,
      date: new Date(),
    });
    console.log("Comment written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding comment: ", e);
    throw e;
  }
};
