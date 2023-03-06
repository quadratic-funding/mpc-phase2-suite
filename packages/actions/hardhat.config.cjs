const { ethers } = require("ethers")
require("@nomicfoundation/hardhat-toolbox")

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

module.exports = {
    solidity: {
      version: "0.8.10",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
    mocha: {
        timeout: 100000000
    },
    paths: {
        tests: "test"
    },
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
  };
