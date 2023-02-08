import * as functions from "firebase-functions"
import { UserRecord } from "firebase-functions/v1/auth"
import admin from "firebase-admin"
import dotenv from "dotenv"
import { getCurrentServerTimestampInMillis } from "../lib/utils"
import { makeError, printLog, SPECIFIC_ERRORS } from "../lib/errors"
import { LogLevel } from "../../types/enums"

dotenv.config()

/**
 * Record the authenticated user information inside the Firestore DB upon authentication.
 * @dev the data is recorded in a new document in the `users` collection.
 * @notice this method is automatically triggered upon user authentication in the Firebase app
 * which uses the Firebase Authentication service.
 */
export const registerAuthUser = functions.auth.user().onCreate(async (user: UserRecord) => {
    // Get DB.
    const firestore = admin.firestore()

    // Get user information.
    if (!user.uid) {
        const error = SPECIFIC_ERRORS.SE_AUTH_NO_CURRENT_AUTH_USER

        printLog(
            `${error.code}: ${error.message} ${!error.details ? "" : `\ndetails: ${error.details}`}`,
            LogLevel.ERROR
        )
        throw error
    }

    // The user object has basic properties such as display name, email, etc.
    const { displayName } = user
    const { email } = user
    const { photoURL } = user
    const { emailVerified } = user

    // Metadata.
    const { creationTime } = user.metadata
    const { lastSignInTime } = user.metadata

    // The user's ID, unique to the Firebase project. Do NOT use
    // this value to authenticate with your backend server, if
    // you have one. Use User.getToken() instead.
    const { uid } = user

    // Reference to a document using uid.
    const userRef = firestore.collection("users").doc(uid)

    // Set document (nb. we refer to providerData[0] because we use Github OAuth provider only).
    await userRef.set({
        name: displayName,
        displayName,
        // Metadata.
        creationTime,
        lastSignInTime,
        // Optional.
        email: email || "",
        emailVerified: emailVerified || false,
        photoURL: photoURL || "",
        lastUpdated: getCurrentServerTimestampInMillis()
    })

    printLog(`Authenticated user document with identifier ${uid} has been correctly stored`, LogLevel.INFO)
})

/**
 * Set custom claims for role-based access control on the newly created user.
 * @notice this method is automatically triggered upon user authentication in the Firebase app
 * which uses the Firebase Authentication service.
 */
export const processSignUpWithCustomClaims = functions.auth.user().onCreate(async (user: UserRecord) => {
    // Get user information.
    if (!user.uid) {
        const error = SPECIFIC_ERRORS.SE_AUTH_NO_CURRENT_AUTH_USER

        printLog(
            `${error.code}: ${error.message} ${!error.details ? "" : `\ndetails: ${error.details}`}`,
            LogLevel.ERROR
        )
        throw error
    }

    // Prepare state.
    let customClaims: any

    // Check if user meets role criteria to be a coordinator.
    if (
        user.email &&
        (user.email.endsWith(`@${process.env.CUSTOM_CLAIMS_COORDINATOR_EMAIL_ADDRESS_OR_DOMAIN}`) ||
            user.email === process.env.CUSTOM_CLAIMS_COORDINATOR_EMAIL_ADDRESS_OR_DOMAIN)
    ) {
        customClaims = { coordinator: true }

        printLog(`Authenticated user ${user.uid} has been identified as coordinator`, LogLevel.INFO)
    } else {
        customClaims = { participant: true }

        printLog(`Authenticated user ${user.uid} has been identified as coordinator`, LogLevel.INFO)
    }

    try {
        // Set custom user claims on this newly created user.
        await admin.auth().setCustomUserClaims(user.uid, customClaims)
    } catch (error: any) {
        const specificError = SPECIFIC_ERRORS.SE_AUTH_SET_CUSTOM_USER_CLAIMS_FAIL
        const additionalDetails = error.toString()

        printLog(`${specificError.code}: ${specificError.message} - ${error.toString()}`, LogLevel.ERROR)
        throw makeError(specificError.code, specificError.message, additionalDetails)
    }
})
