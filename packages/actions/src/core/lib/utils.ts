import open from "open"
// import clipboard from "clipboardy" // TODO: need a substitute.
import { Verification } from "@octokit/auth-oauth-device/dist-types/types"
import { OAuthCredential, GithubAuthProvider } from "firebase/auth"
import { FirebaseDocumentInfo } from "types"
import { Firestore } from "firebase/firestore"
import { getCurrentContributorContribution } from "src/helpers/query"

/**
 * @dev TODO: needs refactoring.
 * Custom countdown which throws an error when expires.
 * @param durationInSeconds <number> - the amount of time to be counted expressed in seconds.
 * @param intervalInSeconds <number> - the amount of time that must elapse between updates (default 1s === 1ms).
 */
const createExpirationCountdown = (durationInSeconds: number, intervalInSeconds = 1000) => {
    let seconds = durationInSeconds <= 60 ? durationInSeconds : 60

    setInterval(() => {
        try {
            if (durationInSeconds !== 0) {
                // Update times.
                durationInSeconds -= intervalInSeconds
                seconds -= intervalInSeconds

                if (seconds % 60 === 0) seconds = 0

                process.stdout.write(`Expires in 00:${Math.floor(durationInSeconds / 60)}:${seconds}\r`)
            } else console.log(`Expired`)
        } catch (err: any) {
            // Workaround to the \r.
            process.stdout.write(`\n\n`)
            console.log(`Expired`)
        }
    }, intervalInSeconds * 1000)
}

/**
 * Callback to manage the data requested for Github OAuth2.0 device flow.
 * @param verification <Verification> - the data from Github OAuth2.0 device flow.
 */
export const onVerification = async (verification: Verification): Promise<void> => {
    // Automatically open the page (# Step 2).
    await open(verification.verification_uri)

    // TODO: need a substitute for `clipboardy` package.
    // Copy code to clipboard.
    // clipboard.writeSync(verification.user_code)
    // clipboard.readSync()

    // Display data.
    // TODO. custom theme is missing.
    console.log(
        `Visit ${verification.verification_uri} on this device to authenticate\nYour auth code: ${verification.user_code}`
    )

    // Countdown for time expiration.
    createExpirationCountdown(verification.expires_in, 1)
}

/**
 * Exchange the Github OAuth 2.0 token for a Firebase credential.
 * @param token <string> - the Github OAuth 2.0 token to be exchanged.
 * @returns <OAuthCredential> - the Firebase OAuth credential object.
 */
export const exchangeGithubTokenForFirebaseCredentials = (token: string): OAuthCredential =>
    GithubAuthProvider.credential(token)


    /**
 * Return the next circuit where the participant needs to compute or has computed the contribution.
 * @param circuits <Array<FirebaseDocumentInfo>> - the ceremony circuits document.
 * @param nextCircuitPosition <number> - the position in the sequence of circuits where the next contribution must be done.
 * @returns <FirebaseDocumentInfo>
 */
export const getNextCircuitForContribution = (
    circuits: Array<FirebaseDocumentInfo>,
    nextCircuitPosition: number
): FirebaseDocumentInfo[] => {
    // Filter for sequence position (should match contribution progress).
    const filteredCircuits = circuits.filter(
        (circuit: FirebaseDocumentInfo) => circuit.data.sequencePosition === nextCircuitPosition
    )

    return filteredCircuits
}

/**
 * Return the index of a given participant in a circuit waiting queue.
 * @param contributors <Array<string>> - the list of the contributors in queue for a circuit.
 * @param participantId <string> - the unique identifier of the participant.
 * @returns <number>
 */
export const getParticipantPositionInQueue = (contributors: Array<string>, participantId: string): number =>
    contributors.indexOf(participantId) + 1


/**
 * Return an array of true of false based on contribution verification result per each circuit.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param participantId <string> - the unique identifier of the contributor.
 * @param circuits <Array<FirebaseDocumentInfo>> - the Firestore documents of the ceremony circuits.
 * @param finalize <boolean> - true when finalizing; otherwise false.
 * @returns <Promise<Array<boolean>>>
 */
export const getContributorContributionsVerificationResults = async (
    firestore: Firestore,
    ceremonyId: string,
    participantId: string,
    circuits: Array<FirebaseDocumentInfo>,
    finalize: boolean
): Promise<Array<boolean>> => {
    // Keep track contributions verification results.
    const contributions: Array<boolean> = []

    // Retrieve valid/invalid contributions.
    for await (const circuit of circuits) {
        // Get contributions to circuit from contributor.
        const contributionsToCircuit = await getCurrentContributorContribution(firestore, ceremonyId, circuit.id, participantId)

        let contribution: FirebaseDocumentInfo

        if (finalize)
            // There should be two contributions from coordinator (one is finalization).
            contribution = contributionsToCircuit
                .filter((contrib: FirebaseDocumentInfo) => contrib.data.zkeyIndex === "final")
                .at(0)!
        // There will be only one contribution.
        else contribution = contributionsToCircuit.at(0)!

        if (contribution) {
            // Get data.
            const contributionData = contribution.data

            if (!contributionData) throw new Error('Something went wrong when retrieving the data from the database')

            // Update contributions validity.
            contributions.push(!!contributionData?.valid)
        }
    }

    return contributions
}