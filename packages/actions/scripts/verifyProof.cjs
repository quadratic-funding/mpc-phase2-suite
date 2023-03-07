const { ethers } = require("hardhat")
const dotenv = require("dotenv")
const { cwd } = require("process")
const fs = require("fs")
const { formatSolidityCalldata, generateGROTH16Proof, verifyGROTH16ProofOnChain } = require("@zkmpc/actions")

dotenv.config()

const main = async () => {
    const contractFactory = await ethers.getContractFactory("MockVerifier")
    let contract
    if (!process.env.VERIFIER_CONTRACT_ADDRESS) {
        contract = await contractFactory.deploy()
        await contract.deployed()
        console.log(`Contract deployed to ${contract.address}`)
    } else contract = contractFactory.attach(process.env.VERIFIER_CONTRACT_ADDRESS)

    const wasmPath = `${cwd()}/scripts/artifacts/circuit.wasm`
    const zkeyPath = `${cwd()}/scripts/artifacts/circuit_0000.zkey`
    const inputPath = `${cwd()}/scripts/artifacts/input.json`

    const inputs = JSON.parse(fs.readFileSync(inputPath).toString())
    const { proof, publicSignals } = await generateGROTH16Proof(inputs, zkeyPath, wasmPath)
    const calldata = formatSolidityCalldata(publicSignals, proof)

    const result = await verifyGROTH16ProofOnChain(contract, calldata)

    if (result) console.log("[+] Proof valid")
    else console.log("[-] Proof not valid")
    process.exit(0)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
