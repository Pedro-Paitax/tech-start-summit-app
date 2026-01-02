import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export async function checkTourStatus(userId: string | undefined): Promise<boolean> {
  if (!userId) {
    const localStatus = localStorage.getItem("app_tour_completed");
    return localStatus === "true";
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return !!data.tourCompleted;
    }
    return false;
  } catch {
    return false;
  }
}

export async function markTourComplete(userId: string | undefined): Promise<void> {
  if (!userId) {
    localStorage.setItem("app_tour_completed", "true");
  } else {
    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { tourCompleted: true }, { merge: true });
    } catch (error) {
      console.error(error);
    }
  }
}