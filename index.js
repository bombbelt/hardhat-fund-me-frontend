// in JS we use import instead of require() like in NodeJS
// import ethers module
import { ethers } from "./ethers-5.6.esm.min.js"
// import abi & contractAddress from constants.js
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

// console.log(ethers)

// Connect to MetaMask account
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

// getBalance Fn
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

// Fund Fn
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethereum}...`)
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // signer / wallet / someone with gas to send it
        const signer = provider.getSigner()
        // console.log(signer)
        // contract that we are interacting with
        // ^ ABI & Address
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // hey, wait for this TX to finish
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

// Listen for tx to be mined
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        // listen for this TX to finish
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

// Withdraw Fn
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
