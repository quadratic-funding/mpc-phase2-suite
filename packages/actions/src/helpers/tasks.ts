import { task } from "hardhat/config"
import { cwd } from "process"
import { verifyCeremony } from "./contracts"
import {
    createMockUser,
    deleteAdminApp,
    generatePseudoRandomStringOfNumbers,
    initializeAdminServices,
    initializeUserServices
} from "../../test/utils"

task("verifyCeremony", "A task that can be used to verify a ceremony finalization validity")
    .addPositionalParam("ceremonyPrefix")
    .addPositionalParam("wasmPath")
    .addPositionalParam("circuitInputsPath")
    .setAction(async (taskArgs, hre) => {
        // get a signer
        const [deployer] = await hre.ethers.getSigners()

        // init user and admin app
        const { adminAuth, adminFirestore } = initializeAdminServices()
        const { userApp, userFirestore, userFunctions } = initializeUserServices()

        const outputDirectory = `${cwd()}/test/data/artifacts/verification/`
        const verifierTemplatePath = `${cwd()}/../../node_modules/snarkjs/templates/verifier_groth16.sol.ejs`

        // create user
        const coordinatorEmail = "coordinator@email.com"
        const coordinatorPassword = generatePseudoRandomStringOfNumbers(20)
        const coordinatorUID = await createMockUser(userApp, coordinatorEmail, coordinatorPassword, true, adminAuth)

        try {
            // verify ceremony
            await verifyCeremony(
                userFunctions,
                userFirestore,
                taskArgs.ceremonyPrefix,
                outputDirectory,
                taskArgs.wasmPath,
                taskArgs.circuitInputs,
                verifierTemplatePath,
                deployer
            )

            // if we are here it is because it didn't throw so we can safely assume that it all was veriifer
            console.log(`[+] The artifacts generated by the ceremony ${taskArgs.ceremonyPrefix} are valid\n`)
        } catch (err: any) {
            console.log(`[-] Could not verify the ceremony validity. ${err.toString()}\n`)
        } finally {
            // Clean ceremony and user from DB.
            await adminFirestore.collection("users").doc(coordinatorUID).delete()
            // Remove Auth user.
            await adminAuth.deleteUser(coordinatorUID)
            // Delete admin app.
            await deleteAdminApp()
        }
    })