import { DocumentData, Firestore, where } from "firebase/firestore"
import { CeremonyCollectionField, CeremonyState, Collections, FirebaseDocumentInfo } from "../../../types/index"
import { 
    getCurrentContributorContribution,
    queryCollection, 
    fromQueryToFirebaseDocumentInfo, 
    getAllCollectionDocs 
} from "../../helpers/query"
import { Functions, httpsCallable } from "firebase/functions"

/**
 * Query for opened ceremonies documents and return their data (if any).
 * @param firestoreDatabase <Firestore> - the Firebase Firestore associated to the current application.
 * @returns <Promise<Array<FirebaseDocumentInfo>>>
 */
export const getOpenedCeremonies = async (firestoreDatabase: Firestore): Promise<Array<FirebaseDocumentInfo>> => {
    const runningStateCeremoniesQuerySnap = await queryCollection(firestoreDatabase, Collections.CEREMONIES, [
        where(CeremonyCollectionField.STATE, "==", CeremonyState.OPENED),
        where(CeremonyCollectionField.END_DATE, ">=", Date.now())
    ])

    return runningStateCeremoniesQuerySnap.empty && runningStateCeremoniesQuerySnap.size === 0
        ? []
        : fromQueryToFirebaseDocumentInfo(runningStateCeremoniesQuerySnap.docs)
}

/**
 * Retrieve all circuits associated to a ceremony.
 * @param firestoreDatabase <Firestore> - the Firebase Firestore associated to the current application.
 * @param ceremonyId <string> - the identifier of the ceremony.
 * @returns Promise<Array<FirebaseDocumentInfo>>
 */
export const getCeremonyCircuits = async (
    firestoreDatabase: Firestore,
    ceremonyId: string
): Promise<Array<FirebaseDocumentInfo>> =>
    fromQueryToFirebaseDocumentInfo(
        await getAllCollectionDocs(firestoreDatabase, `${Collections.CEREMONIES}/${ceremonyId}/${Collections.CIRCUITS}`)
    ).sort((a: FirebaseDocumentInfo, b: FirebaseDocumentInfo) => a.data.sequencePosition - b.data.sequencePosition)


/**
 * Calls the cloud function checkParticipantForCeremony
 * @param functions <Functions> - The Firebase functions
 * @param ceremonyId <string> - The ceremony ID for which to query participants
 * @returns 
 */
export const checkParticipantForCeremony = async (
    functions: Functions,
    ceremonyId: string
): Promise<any> => {
    const cf = httpsCallable(functions, 'checkParticipantForCeremony')
    return await cf({ ceremonyId: ceremonyId })
}

/**
 * Calls the cloud function makeProgressToNextContribution
 * @param functions <Functions> - The Firebase functions
 * @param ceremonyId <string> - The ceremony ID in use
 */
export const makeProgressToNextContribution = async (
    functions: Functions, 
    ceremonyId: string
): Promise<any> => {
    const cf = httpsCallable(functions, 'makeProgressToNextContribution')
    return await cf({ ceremonyId })
}

export const resumeContributionAfterTimeoutExpiration = async (
    functions: Functions,
    ceremonyId: string
): Promise<any> => {
    const cf = httpsCallable(functions, 'resumeContributionAfterTimeoutExpiration')
    return await cf({ ceremonyId })
}

/**
 * Return the attestation made only from valid contributions.
 * @param firestore <Firestore> - the Firestore DB
 * @param contributionsValidities Array<boolean> - an array of booleans (true when contribution is valid; otherwise false).
 * @param circuits <Array<FirebaseDocumentInfo>> - the Firestore documents of the ceremony circuits.
 * @param participantData <DocumentData> - the document data of the participant.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param participantId <string> - the unique identifier of the contributor.
 * @param attestationPreamble <string> - the preamble of the attestation.
 * @param finalize <boolean> - true only when finalizing, otherwise false.
 * @returns <Promise<string>> - the complete attestation string.
 */
export const getValidContributionAttestation = async (
    firestore: Firestore,
    contributionsValidities: Array<boolean>,
    circuits: Array<FirebaseDocumentInfo>,
    participantData: DocumentData,
    ceremonyId: string,
    participantId: string,
    attestationPreamble: string,
    finalize: boolean
): Promise<string> => {
    let attestation = attestationPreamble

    // For each contribution validity.
    for (let idx = 0; idx < contributionsValidities.length; idx += 1) {
        if (contributionsValidities[idx]) {
            // Extract data from circuit.
            const circuit = circuits[idx]

            let contributionHash: string = ""

            // Get the contribution hash.
            if (finalize) {
                const numberOfContributions = participantData.contributions.length
                contributionHash = participantData.contributions[numberOfContributions / 2 + idx].hash
            } else contributionHash = participantData.contributions[idx].hash

            // Get the contribution data.
            const contributions = await getCurrentContributorContribution(firestore, ceremonyId, circuit.id, participantId)

            let contributionData: DocumentData

            if (finalize)
                contributionData = contributions.filter(
                    (contribution: FirebaseDocumentInfo) => contribution.data.zkeyIndex === "final"
                )[0].data!
            else contributionData = contributions.at(0)?.data!

            // Attestate.
            attestation = `${attestation}\n\nCircuit # ${circuit.data.sequencePosition} (${
                circuit.data.prefix
            })\nContributor # ${
                contributionData?.zkeyIndex > 0 ? Number(contributionData?.zkeyIndex) : contributionData?.zkeyIndex
            }\n${contributionHash}`
        }
    }

    return attestation
}