import app from "../firebaseConfig";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";

const db = getFirestore(app, "bddvalentin");

export const createPost = async (title, text, createdBy, imageUrl, createdByUid) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      title,
      text,
      date: new Date(),
      createdBy,
      createdByUid,
      ...(imageUrl ? { imageUrl } : {}),
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};
