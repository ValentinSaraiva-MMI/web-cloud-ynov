import * as Notifications from 'expo-notifications';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import app from '../firebaseConfig';

const db = getFirestore(app, 'bddvalentin');

export async function registerPushToken(userId) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  const tokenRef = doc(db, 'pushTokens', userId);
  await setDoc(tokenRef, { token: token }, { merge: true });
}
