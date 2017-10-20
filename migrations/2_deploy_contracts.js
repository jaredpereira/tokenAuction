var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");
var TokenAuction = artifacts.require("./TokenAuction.sol")

module.exports = function(deployer) {
  deployer.deploy(TokenAuction, [10]);
    web3.eth.sendTransaction({from: web3.eth.accounts[0], to: '0x59C3A7788F830638ea5f12333e9C4f7c280Bc21F', value: web3.toWei(10, 'ether')})
};
