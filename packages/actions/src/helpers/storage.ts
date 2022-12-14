import { Functions, httpsCallable } from "firebase/functions";
import dotenv from "dotenv"

dotenv.config({ path: `../../.env.test}`})


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

/**
 * Return the bucket name based on ceremony prefix.
 * @param ceremonyPrefix <string> - the ceremony prefix.
 * @returns <string>
 */
export const getBucketName = (ceremonyPrefix: string): string => {
    if (!process.env.CONFIG_CEREMONY_BUCKET_POSTFIX) throw new Error('Storage-001: Check that all CONFIG environment variables are configured properly')

    return `${ceremonyPrefix}${process.env.CONFIG_CEREMONY_BUCKET_POSTFIX!}`
}