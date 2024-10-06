import { pinata } from './config'; // Adjust the import path as necessary

export async function uploadToPinata(file: File): Promise<string> {
  try {
    const result = await pinata.upload.file(file);
    if (!result || !result.IpfsHash) {
      throw new Error('Failed to upload file: No IPFS hash returned');
    }
    console.log('File uploaded to Pinata:', result);
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}
