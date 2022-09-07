import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import { useAppSelector, useAppDispatch } from '../hooks'
import { closeVideoscreenDialog } from '../stores/VideoscreenStore'

import {Moralis} from 'moralis-v1/dist/moralis.js'
import { fileURLToPath } from 'url'


const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  padding: 16px 180px 16px 16px;
`
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #222639;
  border-radius: 16px;
  padding: 16px;
  color: #eee;
  position: relative;
  display: flex;
  flex-direction: column;

  .close {
    position: absolute;
    top: 16px;
    right: 16px;
  }
`

const VideoscreenWrapper = styled.div`
  flex: 1;
  border-radius: 25px;
  overflow: hidden;
  margin-right: 50px;

  iframe {
    width: 100%;
    height: 100%;
    background: #fff;
  }
`

const CardWrapper = styled.div`
  display:flex;
  flex-wrap:wrap;
`

const Card = styled.div`
  width: 250px;
  background: black;
  border-radius:10px;
  padding: 10px;
  margin: 10px;
`

export default function VideoscreenDialog() {
  
  const dispatch = useAppDispatch()

  const [page, setPage] = useState<string>("HACKS")
  const toSubmit = () => {
    setPage("SUBMIT")
  }
  const toHacks = () => {
    setPage("HACKS")

  }
  const toEdit = () => {
    setPage("EDIT")
    fetchTokenId()
  }
  
  // TO SUBMIT A HACK: 

  const [submitTitle, setSubmitTitle] = useState("")
  const [submitText, setSubmitText] = useState("")
  const [submitImage, setSumbitImage] = useState("")
  const [submitGithubLink, setSubmitGithubLink] = useState("")
  const [submitLiveLink, setSubmitLiveLink] = useState("")
  const [submitYoutubeLink, setSubmitYoutubeLink] = useState("")


  const uploadFile = async (event) => {
    event.preventDefault()
    const metadata = {
      name: submitTitle,
      description: submitText,
      image: "https://via.placeholder.com/600x400.png",
      external_url: submitLiveLink,
      youtube_url: submitYoutubeLink,
      github_url: submitGithubLink,
    }

    try {
      const file = new Moralis.File(
        "metadata.json",
        { base64: btoa(JSON.stringify(metadata))},
        {
          type: "base64",
          saveIPFS: true,
        }
      )
      const result = await file.saveIPFS()
      // alert(result.ipfs())
      await mint(result.ipfs())
      
    } catch (error) {
      alert(error.message)
    }
  }

  const mint = async (_uri) => {
    let user = await Moralis.User.current()
    let options = {
      contractAddress: "0xf55080C038bd608F8D49091E138103b1F81A6Bcd",
      functionName: "mintHack", 
      abi: [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "uri",
              "type": "string"
            }
          ],
          "name": "mintHack",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
      ],
      params: {
        to: user.get('ethAddress'),
        uri: _uri,
      },
      msgValue: 0,
    }

    console.log("testingminter")
    const transaction = await Moralis.executeFunction(options)
    
    console.log(transaction.hash)
    await transaction.wait()
  } 

  const fetchTokenId = async () => {
    let user = Moralis.User.current()
    const options = {
      chain: "mumbai",
      address: user.get('ethAddress'),
      token_address: "0xf55080C038bd608F8D49091E138103b1F81A6Bcd",
    }
    const polygonNFTs = await Moralis.Web3API.account.getNFTsForContract(options)

    setHacksTokenId(polygonNFTs.result[0].token_id)
  }

  const uploadEditFile = async (event) => {
    event.preventDefault()
    const metadata = {
      name: submitTitle,
      description: submitText,
      image: "https://via.placeholder.com/600x400.png",
      external_url: submitLiveLink,
      youtube_url: submitYoutubeLink,
      github_url: submitGithubLink,
    }

    try {
      const file = new Moralis.File(
        "metadata.json",
        { base64: btoa(JSON.stringify(metadata))},
        {
          type: "base64",
          saveIPFS: true,
        }
      )
      const result = await file.saveIPFS()
      // alert(result.ipfs())
      await edit(result.ipfs())
      
    } catch (error) {
      alert(error.message)
    }
  }

  const edit = async (_uri) => {
    let options = {
      contractAddress: "0xf55080C038bd608F8D49091E138103b1F81A6Bcd",
      functionName: "editHack", 
      abi: [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "uri",
              "type": "string"
            }
          ],
          "name": "editHack",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
      ],
      params: {
        tokenId: hacksTokenId,
        uri: _uri,
      },
      msgValue: 0,
    }
    const transaction = await Moralis.executeFunction(options)
    
    console.log(transaction.hash)
    await transaction.wait()
  } 

  // TO GET ALL THE STUFF: 

  const [hacks, setHacks] = useState()
  const [hacksContent, setHacksContent] = useState([] as any)
  const [hacksTokenId, setHacksTokenId] = useState()

  const fetchAllNFTs = async () => {
    
    Moralis.enableWeb3() 
    const options = {
      address: "0xf55080C038bd608F8D49091E138103b1F81A6Bcd",
      chain: "mumbai",
    };
    const nftOwners = await Moralis.Web3API.token.getNFTOwners(options);
    
    // console.log(nftOwners.result)
    const tokenUri = nftOwners?.result?.map((data) => {
      const {metadata, owner_of} = data
      
        if (metadata && metadata != null) {
        
          const metadataObj = JSON.parse(metadata)
        
          const {name, description, image, github_url, external_url} = metadataObj
          // console.log(metadataObj)
          return {name, description, image, github_url, external_url, owner_of}
        } else console.log("skip")
    }) 

    
    console.log(tokenUri)
    setHacks(tokenUri)
    
  }

  const fetchHacksContent = async () => {
    const limit5 = hacks?.slice(0,5)
    let contentHack:any[] = []

    if (limit5) {
      limit5.map(async (hack) => {
        if (hack && hack != undefined) {
          const {name, description, image, github_url, external_url, owner_of} = hack
          contentHack.push({name, description, image, github_url, external_url, owner_of}); 
        }
      })
    }
    console.log(contentHack)
    setHacksContent(contentHack)
  }

  

  useEffect (() => {
    if (hacks) {
      fetchHacksContent()
      
    }
  }, [hacks])


  useEffect (() => {
    if (!hacks) {
      fetchAllNFTs()
      
    }
  }, []); 
  
  const truncateAddy = (input) => {
    if (input.length > 5) {
       return input.substring(0, 7) + '...';
    }
    return input;
  }

  const truncateDescription = (input) => {
    if (input.length > 55) {
       return input.substring(0, 55) + '...';
    }
    return input;
  }

  function RenderOfCards() {
    function renderer() {
      return (
        <CardWrapper>
          {hacks && hacksContent.map(( card, i) => {
            const {name, description, image, github_url, external_url, owner_of} = card;
            const ownerUrl = `https://testnets.opensea.io/${owner_of}`
            return ( 
              <Card key={i}>
                <h1>{name}</h1>
                <img style={{maxWidth:"100%", maxHeight: "160px"}} src={image}/>
                <p>{truncateDescription(description)}</p>
                <div style={{display:"flex", justifyContent: "space-around"}}>
                  <p><a target={"_blank"} href={github_url}>Github</a></p>
                  <p><a target={"_blank"} href={external_url}>Dapp</a></p>
                </div>
                <p><a target={"_blank"} href={ownerUrl}>{truncateAddy(owner_of)}</a></p>
              </Card>
              
            ); 
          })}
        </CardWrapper>
      )
    }
    return renderer();
  };



  return (
    <Backdrop>
      <Wrapper>
        <IconButton
          aria-label="close dialog"
          className="close"
          onClick={() => dispatch(closeVideoscreenDialog())}
        >
          <CloseIcon />
        </IconButton>
        
          <VideoscreenWrapper>
            
            {page == "HACKS" ? (
              <>
                <h1>Hackathon Entries</h1>
                <p onClick={toSubmit}>Submit your hack</p> <p onClick={toEdit}>Edit your hack</p>
                
                  {RenderOfCards()}
               
    
                
              </>
            ):(<></>)}
            {page == "SUBMIT" ? (
              <>
                <h1>Submit your hack</h1>
                <p onClick={toHacks}>Back</p> 
                <div>
                  <form onSubmit={uploadFile} className="writeForm">
                    <div className="writeFormGroup">
                      <input
                        className="writeInput"
                        placeholder="Title"
                        type="text"
                        autoFocus={true}
                        value={submitTitle}
                        onChange={(e) => setSubmitTitle(e.target.value)}
                      />
                    </div>
                    <div className="writeFormGroup">
                      <textarea
                        className="writeInput writeText"
                        placeholder="Short description of your project..."
                        autoFocus={true}
                        value={submitText}
                        onChange={(e) => setSubmitText(e.target.value)}
                      />
                      <input
                        className="writeInput writeText"
                        placeholder="Github Link"
                        type="text"
                        autoFocus={true}
                        value={submitGithubLink}
                        onChange={(e) => setSubmitGithubLink(e.target.value)}
                      />
                   
                      <input
                        className="writeInput writeText"
                        placeholder="Dapp Link"
                        type="text"
                        autoFocus={true}
                        value={submitLiveLink}
                        onChange={(e) => setSubmitLiveLink(e.target.value)}
                      />
                    </div>
                   
                      
                    
                    <button className="writeSubmit" type="submit">
                      Submit
                    </button>
                  </form>
                </div>

              </>
            ):(<></>)}

            {page == "EDIT" ? (
              <>
                <h1>Edit your hack</h1>
                <p onClick={toHacks}>Back</p> 
                <div>
                  <form onSubmit={uploadEditFile} className="writeForm">
                    <div className="writeFormGroup">
                      <input
                        className="writeInput"
                        placeholder="Title"
                        type="text"
                        autoFocus={true}
                        value={submitTitle}
                        onChange={(e) => setSubmitTitle(e.target.value)}
                      />
                    </div>
                    <div className="writeFormGroup">
                      <textarea
                        className="writeInput writeText"
                        placeholder="Short description of your project..."
                        autoFocus={true}
                        value={submitText}
                        onChange={(e) => setSubmitText(e.target.value)}
                      />
                      <input
                        className="writeInput writeText"
                        placeholder="Github Link"
                        type="text"
                        autoFocus={true}
                        value={submitGithubLink}
                        onChange={(e) => setSubmitGithubLink(e.target.value)}
                      />
                   
                      <input
                        className="writeInput writeText"
                        placeholder="Dapp Link"
                        type="text"
                        autoFocus={true}
                        value={submitLiveLink}
                        onChange={(e) => setSubmitLiveLink(e.target.value)}
                      />
                    </div>
                   
                      
                    
                    <button className="writeSubmit" type="submit">
                      Submit
                    </button>
                  </form>
                </div>

              </>
            ):(<></>)}
            

          </VideoscreenWrapper>
        
      </Wrapper>
    </Backdrop>
  )
}
