import { assert } from "console"
import { ethers } from "hardhat"

/**
 * Deploy the Verifier contract
 */
async function main() {
    const contractFactory = await ethers.getContractFactory("MockVerifier")
    const contract = await contractFactory.deploy()
    assert(ethers.utils.isAddress(contract.address), "The contract was not deployed")

    console.log(`Contract deployed to ${contract.address}`)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
