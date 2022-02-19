import { ethers } from 'ethers'
import { useState } from 'react'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import Image from 'next/image'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
const urlPrefix = 'https://ipfs.infura.io/ipfs/'

import { nftAddress, nftMarketAddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`)
      })
      const url = `${urlPrefix}${added.path}`
      setFileUrl(url)
    } catch (e) {
      console.error(e)
    }
  }

  async function createItem() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return

    const data = JSON.stringify({
      name,
      description,
      image: fileUrl
    })

    try {
      const added = await client.add(data, {
        progress: (prog) => console.log(`received: ${prog}`)
      })
      const url = `${urlPrefix}${added.path}`
      createSale(url)
    } catch (e) {
      console.error(e)
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    // create nft
    let contract = new ethers.Contract(nftAddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let txn = await transaction.wait()
    // console.log(txn)
    let event = txn.events[0]
    // console.log(event)
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    // instantiate market contract and get listingPrice
    contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    // put nft up for sale
    transaction = await contract.sellMarketItem(
      nftAddress, tokenId, price, { value: listingPrice }
    )
    await transaction.wait()
    
    // send user to main page
    router.push('/')
  }

  return (
    <div className='flex justify-center'>
      <div className='w-1/2 flex flex-col pb-12'>
        <input 
          placeholder='Asset Name'
          className='mt-8 border rounded p-4'
          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
        />
        <input 
          placeholder='Asset Description'
          className='mt-2 border rounded p-4'
          onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
        />
        <input 
          placeholder='Asset Price (MATIC)'
          className='mt-2 border rounded p-4'
          onChange={(e) => setFormInput({ ...formInput, price: e.target.value })}
        />
        <input 
          type='file'
          name='Asset'
          className='my-4'
          onChange={onChange}
        />
        {
          fileUrl && (
            <Image alt='' className='rounded mt-4' width="100%" height="100%" layout="responsive" src={fileUrl} />
          )
        }
        <button
          onClick={createItem}
          className='font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg'
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  )
}