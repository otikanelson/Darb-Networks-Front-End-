import { db } from "../Firebase";
import { collection, addDoc } from "firebase/firestore";

export const createLoanRequest = async (loanData) => {
  try {
    const loanRef = await addDoc(collection(db, "loanRequests"), loanData);
    return loanRef.id;
  } catch (error) {
    console.error("Error creating loan request:", error);
    throw error;
  }
};
