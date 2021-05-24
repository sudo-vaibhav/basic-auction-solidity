import { useEffect, useState } from "react"
import { CONTRACT_ABI,CONTRACT_ADDRESS} from "./config"
import Web3 from 'web3'
import AddProduct from "./components/AddProduct"

function App() {
  const [state, setState] = useState({ account: "" })
  async function loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    const network = await web3.eth.net.getNetworkType()
    console.log("network:", network)
    setState((state) => ({ ...state, account: accounts[0] }))
    const auctionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS)
    setState(state => ({ ...state, auctionContract }))
    const products = await auctionContract.methods.getProducts().call()
    console.log("products,", products)
    setState(state => ({ ...state, products }))
  }

  const bid = (productId) => {
    const value = prompt("How much amount of bid to place?")
    console.log("value is ", value)
    console.log("sending from account",state.account)
    try {
      
      state.auctionContract.methods.bid(productId).send({ from: state.account, value }).on('receipt', (receipt) => {
        console.log("transaction receipt received", receipt)
      })
      .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        console.log("transaction rejected", error, receipt)
        alert("Transaction Failed, probably your bid amount is less or you are already the highest bidder")
    });
    }
    catch (err) {
      console.log("bid failed:",err)
    }
  }

  const claim = (productId) => {
    try {
      state.auctionContract.methods.claimProduct(productId).send({ from: state.account }).on("receipt", (receipt) => {
        console.log("claim transaction successful", receipt)
        alert("Claim processed successfully, congratulations on buying the product")
      })
        .on("error", (error, receipt) => {
          console.log("transaction rejected", error, receipt)
          alert("claim not processed, are you sure you won the auction?")
      })
    }
    catch {
      console.log("bid failed")
    }
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div className="container" >
      <h1 style={{marginTop:"4rem"}}>Blockchain Auction</h1>
      <p>Your account: {state.account}</p>
      <div style={{ overflowX: "auto"}}>
      <h2>products:</h2>
      <table>
  <thead>
    <tr>
      <th>Product Name</th>
            <th>Current Bid</th>
            <th>Reserve Price</th>
      <th>Seller</th>
      <th>Current Winning Bidder</th>
            <th>Auction End Time</th>
            <th>Status</th>
            <th>Place Bid</th>
    </tr>
  </thead>
  <tbody>
          {state.products?.map((product, idx) => {
            const biddable = !(product.claimed || parseInt(product.endTime) < Date.now())
            return <tr key={ idx}>
              <td>{ product.name}</td>
              <td>{product.bidAmount }</td>
              <td>{product.minPrice === "0" ? "-":product.minPrice}</td>
              <td>{ product.seller}</td>
              <td>{product.bidder}</td>
              <td>{ new Date(parseInt(product.endTime)).toLocaleString()}</td>
              <td>{ !biddable ? "sold" : "active"}</td>
              <td>
                {product.bidder == state.account && product.claimed ? "claimed" : !biddable && product.bidder == state.account && !product.claimed ? <button onClick={() => { claim(idx)}}>Claim</button>: biddable ? <button onClick={() => { bid(idx)} }>
                  Place Bid
                </button> : "-"}</td>
             </tr>
          })
          }

  </tbody>
</table>
      
      </div>
     <AddProduct contract={state.auctionContract} account={state.account} />
    </div>
  );
}

export default App;
