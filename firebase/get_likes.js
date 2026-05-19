import app from "../firebaseConfig";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const db = getFirestore(app, "bddvalentin");

export const getLikes = async (postId, userId) => {
  const snap = await getDocs(collection(db, "posts", postId, "likes"));
  return {
    count: snap.size,
    liked: userId ? snap.docs.some((d) => d.id === userId) : false,
  };
};
