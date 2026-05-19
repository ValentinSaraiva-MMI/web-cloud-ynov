import app from "../firebaseConfig";
import { deleteDoc, doc, getFirestore, setDoc } from "firebase/firestore";

const db = getFirestore(app, "bddvalentin");

export const toggleLike = async (postId, userId, currentlyLiked) => {
  const likeRef = doc(db, "posts", postId, "likes", userId);
  if (currentlyLiked) {
    await deleteDoc(likeRef);
  } else {
    await setDoc(likeRef, { likedAt: new Date() });
  }
};
