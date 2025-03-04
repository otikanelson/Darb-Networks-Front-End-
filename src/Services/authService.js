import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const signUpUser = async (email, password, fullName, role, bvn) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      email,
      bvn,
      role,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Sign-up error:", error);
    throw error;
  }
};
