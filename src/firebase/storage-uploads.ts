'use client';
import { ref, uploadBytes, getDownloadURL, Storage } from 'firebase/storage';

/**
 * Uploads a file to a user-specific folder in Firebase Storage.
 * @param storage - The Firebase Storage instance.
 * @param userId - The UID of the user uploading the file.
 * @param file - The file to upload.
 * @returns A promise that resolves with the public download URL of the file.
 */
export async function uploadFileToStorage(
  storage: Storage,
  userId: string,
  file: File
): Promise<string> {
  if (!userId) {
    throw new Error('User not authenticated. Cannot upload file.');
  }

  // Create a unique file path
  const filePath = `uploads/${userId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);

  // Upload the file
  const uploadResult = await uploadBytes(storageRef, file);

  // Get the download URL
  const downloadURL = await getDownloadURL(uploadResult.ref);

  return downloadURL;
}
