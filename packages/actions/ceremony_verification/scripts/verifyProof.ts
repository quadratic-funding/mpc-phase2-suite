import { ethers } from "hardhat"
import dotenv from "dotenv"

dotenv.config()

const main = async () => {
    const contractFactory = await ethers.getContractFactory("Verifier")
    let contract
    if (!process.env.VERIFIER_CONTRACT_ADDRESS) {
        contract = await contractFactory.deploy()
        await contract.deployTransaction.wait()
        console.log(`Contract deployed to ${contract.address}`)
    } else contract = contractFactory.attach(process.env.VERIFIER_CONTRACT_ADDRESS)

    // verify proof
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
