const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * test deploy contracts
 * creating nfts
 * putting them up for sale
 * buying nfts
 */

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    // A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts, 
    // so Market here is a factory for instances of our NFTMarket contract.
    const Market = await ethers.getContractFactory('NFTMarket');

    // start the deployment, and return a Promise that resolves to a Contract
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory('NFT');
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed()
    const nftContractAddress = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    // returns a BigNumber representation of value, parsed with ether units
    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    // place 2 nfts on market for sale
    await nft.createToken('https://www.mytokenlocation.com');
    await nft.createToken('https://www.mytokenlocation2.com');
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice });
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice });

    // test addresses
    // A Signer in ethers is an abstraction of an Ethereum Account, 
    // which can be used to sign messages and transactions and send 
    // signed transactions to the Ethereum Network to execute state changing operations.
    const [_, buyerAddress] = await ethers.getSigners();

    // sell an item
    await market.connect(buyerAddress).sellMarketItem(nftContractAddress, 1, { value: auctionPrice });

    const items = await market.fetchMarketItems();

    console.log('items', items)
  });
});
