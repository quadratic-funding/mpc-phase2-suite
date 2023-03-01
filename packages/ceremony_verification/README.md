# Ceremony Verification 

Please use this subfolder to confirm whether the verifier generated after a P0T1ON ceremony works. You will be required to move the generated Solidity verifier in the `packages/actions/ceremony_verification/contracts` folder. 

Make sure you compile the Verifier using with `yarn hardhat compile`.

## Solidity version 

Make sure to update the `hardhat.config.ts` file with the correct Solidity compiler version that is in the exported Verifier contract. 
