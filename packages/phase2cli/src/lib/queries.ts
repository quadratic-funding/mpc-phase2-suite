import { Firestore, where } from "firebase/firestore"
import { queryCollection, fromQueryToFirebaseDocumentInfo, getAllCollectionDocs } from "@zkmpc/actions"
import { collections, contributionsCollectionFields } from "./constants"
import { FirebaseDocumentInfo } from "../../types/index"

/**
 * Retrieve all ceremonies.
 * @param firestore <Firestore> - the instance of the Firestore database.
 * @returns Promise<Array<FirebaseDocumentInfo>>
 */
export const getAllCeremonies = async (firestore: Firestore): Promise<Array<FirebaseDocumentInfo>> =>
    fromQueryToFirebaseDocumentInfo(await getAllCollectionDocs(firestore, collections.ceremonies)).sort(
        (a: FirebaseDocumentInfo, b: FirebaseDocumentInfo) => a.data.sequencePosition - b.data.sequencePosition
    )

/**
 * Query for circuits with a contribution from given participant.
 * @param ceremonyId <string> - the identifier of the ceremony.
 * @param circuits <Array<FirebaseDocumentInfo>> - the circuits of the ceremony
 * @param participantId <string> - the identifier of the participant.
 * @returns <Promise<Array<FirebaseDocumentInfo>>>
 */
export const getCircuitsWithParticipantContribution = async (
    ceremonyId: string,
    circuits: Array<FirebaseDocumentInfo>,
    participantId: string
): Promise<Array<string>> => {
    const circuitsWithContributionIds: Array<string> = [] // nb. store circuit identifier.

    for (const circuit of circuits) {
        const participantContributionQuerySnap = await queryCollection(
            `${collections.ceremonies}/${ceremonyId}/${collections.circuits}/${circuit.id}/${collections.contributions}`,
            [where(contributionsCollectionFields.participantId, "==", participantId)]
        )

        if (participantContributionQuerySnap.size === 1) circuitsWithContributionIds.push(circuit.id)
    }

    return circuitsWithContributionIds
}