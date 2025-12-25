/**
 * Migration utility to fix document ID mismatches
 * Run this once to migrate user data from wrong document ID to correct Auth UID
 */

import firestore from '@react-native-firebase/firestore';

/**
 * Migrate user document from old ID to new ID (Auth UID)
 */
export async function migrateUserDocument(
  oldDocumentId: string,
  newDocumentId: string
): Promise<void> {
  try {
    console.log(`Migrating user document from ${oldDocumentId} to ${newDocumentId}`);
    
    // Get the old document
    const oldDoc = await firestore().collection('users').doc(oldDocumentId).get();
    
    if (!oldDoc.exists) {
      throw new Error(`Old document ${oldDocumentId} does not exist`);
    }
    
    const oldData = oldDoc.data();
    console.log('Old document data:', oldData);
    
    // Create new document with correct ID
    await firestore()
      .collection('users')
      .doc(newDocumentId)
      .set({
        ...oldData,
        id: newDocumentId, // Ensure ID field matches document ID
      }, { merge: true });
    
    console.log('New document created with ID:', newDocumentId);
    
    // Delete old document
    await firestore().collection('users').doc(oldDocumentId).delete();
    
    console.log('Migration complete - old document deleted');
  } catch (error) {
    console.error('Error migrating user document:', error);
    throw error;
  }
}

/**
 * Find user document by username and return its ID
 */
export async function findUserDocumentByUsername(username: string): Promise<string | null> {
  try {
    const query = await firestore()
      .collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    if (query.empty) {
      return null;
    }
    
    return query.docs[0].id;
  } catch (error) {
    console.error('Error finding user by username:', error);
    return null;
  }
}


