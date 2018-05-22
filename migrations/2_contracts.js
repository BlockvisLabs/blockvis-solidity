const EIP820Registry = require("eip820");

module.exports = function (deployer, network, accounts) {
    deployer.then(() => {
        if (network === 'development') {
            const Web3Latest = require("web3");
            const web3latest = new Web3Latest('http://localhost:8545');
            return EIP820Registry.deploy(web3latest, accounts[0]);
        }
    });
};