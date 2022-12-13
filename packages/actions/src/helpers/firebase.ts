import { doc, DocumentSnapshot, Firestore, getDoc } from "firebase/firestore"
import { DocumentData } from "firebase/firestore"

/**
 * Get a specific document from database.
 * @param collection <string> - the name of the collection.
 * @param documentUID <string> - the unique identifier of the document in the collection.
 * @param firestoreDatabase <Firestore> - the Firestore db 
 * @returns <Promise<DocumentSnapshot<DocumentData>>> - return the document from Firestore.
 */
 export const getDocumentById = async (
    collection: string,
    documentUID: string,
    firestoreDatabase: Firestore
): Promise<DocumentSnapshot<DocumentData>> => {
    const docRef = doc(firestoreDatabase, collection, documentUID)

    return getDoc(docRef)
}