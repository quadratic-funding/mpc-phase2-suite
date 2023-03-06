import { HardhatUserConfig } from "hardhat/config"
import { ethers } from "ethers"
import "@nomicfoundation/hardhat-toolbox"

const WALLET_MNEMONIC =
    process.env.WALLET_MNEMONIC || "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
const randomPrivKey = ethers.Wallet.createRandom().privateKey.toString()
const GAS_LIMIT = 30000000
const CHAIN_IDS = {
    ganache: 1337,
    goerli: 5,
    hardhat: 31337,
    arbitrumTestnet: 421613
}

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            gas: GAS_LIMIT,
            blockGasLimit: GAS_LIMIT,
            accounts: { count: 5, mnemonic: WALLET_MNEMONIC },
            chainId: CHAIN_IDS.hardhat
        },
        arbitrum_testnet: {
            url: process.env.RPC_URL_ARBITRUM_TESTNET || "https://goerli-rollup.arbitrum.io/rpc",
            accounts: [process.env.PRIVATE_KEY || randomPrivKey],
            gas: GAS_LIMIT,
            blockGasLimit: GAS_LIMIT,
            chainId: CHAIN_IDS.arbitrumTestnet
        }
    },
    paths: {
        tests: "test"
    },
    mocha: {
        timeout: 100000000
    },
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
                details: {
                    yul: true
                }
            }
        }
    }
}

export default config
