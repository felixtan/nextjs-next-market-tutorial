// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
  // counter that can only incr/decr by 1
  // https://docs.openzeppelin.com/contracts/3.x/api/utils#Counters
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  address contractAddress;

  constructor(address marketplaceAddress) ERC721('Metaverse Tokens', 'METT') {
    contractAddress = marketplaceAddress;
  }

  function createToken(string memory tokenURI) public returns (uint) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();

    // ERC721 method
    // brings ERC721 token into existence with msg.sender as owner
    // discouraged in favor of _safeMint
    _mint(msg.sender, newItemId);

    // ERC721URIStorage method
    _setTokenURI(newItemId, tokenURI);

    // ERC721 method
    // allows contract to operate on all of msg.sender's tokens
    setApprovalForAll(contractAddress, true);

    return newItemId;
  }
}
