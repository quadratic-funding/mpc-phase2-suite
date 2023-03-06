const { ethers } = require("hardhat")
const dotenv = require("dotenv")

dotenv.config()

const main = async () => {
    const contractFactory = await ethers.getContractFactory("MockVerifier")
    let contract
    if (!process.env.VERIFIER_CONTRACT_ADDRESS) {
        contract = await contractFactory.deploy()
        await contract.deployed()
        console.log(`Contract deployed to ${contract.address}`)
    } else contract = contractFactory.attach(process.env.VERIFIER_CONTRACT_ADDRESS)

    // verify proof
    const result = await contract.verifyProof(
        [
            "0x29d8481153908a645b2e083e81794b9fe132306a09fee9f33aa659ffe2d363a7",
            "0x13c901b1b68e686af6cc79f2850c13098d6e20a2da82992614b233860bc5d250"
        ],
        [
            [
                "0x2ba7b8139b6dbe4cf4c37f304f769a8d0f9df1accceeebbfa0468927e1497383",
                "0x1b250dc4deb1289eefe63494481c2e61c29718631209eccef4e3e0a2a54b2342"
            ],
            [
                "0x1fc104df098282bd1c9c0e77ab786acf82ca5418c19c792ee067967e83869576",
                "0x112432d1ed2bdea56271fec942a4e0dc45f27472d5d667379c64ce7091f47cc3"
            ]
        ],
        [
            "0x1bdc2af2a36081f2ba33f1379212fffef9dee1601190d85b87c51809bc9332df",
            "0x1f867ab230c5100685c2a0f7236f08c08e4164d77255827409fd098cb5c5eba3"
        ],
        [
            "0x0000000000000000000000000000000000000000000000000000000000000003",
            "0x0000000000000000000000000000000000000000000000000000000000000007"
        ]
    )
    if (result) console.log("[+] Proof valid")
    else console.log("[-] Proof not valid")
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
