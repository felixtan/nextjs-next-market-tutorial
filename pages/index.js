import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Image from 'next/image'

import { nftAddress, nftMarketAddress } from '../config'

// abis
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState(false)
  // const [modalState]

  useEffect(() => {
    async function loadNFTs() {
      // read-only abstraction to access the blockchain data
      // ethers separates Providers from Signers unlike web3.js
      const provider = new ethers.providers.JsonRpcProvider()

      // abstraction of contract deployed to the blockchain
      const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
      const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, provider)

      const data = await marketContract.fetchMarketItems()

      const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)  // get nft media representation
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        return {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description
        }
      }))

      setNfts(items)
      setLoadingState(false)
    }

    loadNFTs()
  }, [])

  async function buyNFT(nft) {
    // user connects wallet
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    // abstraction of an Ethereum Account, which can be used to sign messages 
    // and transactions and send signed transactions to the Ethereum Network 
    // to execute state changing operations
    const signer = provider.getSigner()

    // contract can act on behalf of the signer
    const contract = new ethers.Contract(nftMarketAddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

    const transaction = await contract.sellMarketItem(nftAddress, nft.tokenId, { value: price })

    await transaction.wait()

    loadNFTs()
  }

  if (!loadingState && !nfts.length) {
    return <h1 className='px-20 py-10 text-3xl'>No items in marketplace</h1>
  }

  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{ maxWidth: 1600 }}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {nfts.map((nft, i) => {
            return (
              <div key={i} className='border shadow rounded-xl overflow-hidden'>
                <Image src={nft.image} width="100%" height="100%" layout="responsive" alt='' />
                <div className='p-4'>
                  <p style={{ height: 64 }} className='text-2xl font-semibold'>{nft.name}</p>
                  <div style={{ height: 70, overflow: 'hidden' }}>
                    <p className='text-gray-400'>{nft.description}</p>
                  </div>
                  <div className='p-4 bg-black'>
                    <p className='text-2xl mb-4 font-bold text-white'>{nft.price} MATIC</p>
                    <button 
                      className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded'
                      onClick={() => buyNFT(nft)}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
