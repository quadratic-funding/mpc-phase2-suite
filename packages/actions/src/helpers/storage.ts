import { Functions, httpsCallable } from "firebase/functions";

/**
 * Generates a pre-signed URL for a S3 download
 * @param functions <Functions> - Firebase functions
 * @param bucketName <string> - The name of the bucket
 * @param objectKey <string> - The S3 key of the object
 * @returns <Promise<any>>
 */
export const generateGetObjectPreSignedUrl = async (
    functions: Functions,
    bucketName: string,
    objectKey: string,
): Promise<any> => {
    const cf = httpsCallable(functions, 'generateGetObjectPreSignedUrl')
    return await cf({ bucketName, objectKey })
}