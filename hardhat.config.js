require("@nomiclabs/hardhat-waffle");
const fs = require('fs')

const privateKey = fs.readFileSync('.secret').toString();

// secrets
const projectId = 'f160278754e64f14acd68a36be1b8f02';

module.exports = {
  networks: {
    // local
    hardhat: {
      chain: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,

      // accounts which run smart contracts
      accounts: [privateKey]
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${projectId}`,
      accounts: [privateKey]
    },
  },
  solidity: "0.8.4",
};
