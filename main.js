import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Seaport } from "@opensea/seaport-js";

// 🔹 Backend URL-ni Render URL ilə əvəz et
const BACKEND_URL = "https://cuzdangos-2.onrender.com";

const PROXY_CONTRACT_ADDRESS = "0x9656448941C76B79A39BC4ad68f6fb9F01181EC7";
const NFT_CONTRACT_ADDRESS = "0x54a88333F6e7540eA982261301309048aC431eD5";
const APECHAIN_ID = 33139;

let provider, signer, seaport, userAddress;

const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const addrSpan = document.getElementById("addr");
const marketplaceDiv = document.getElementById("marketplace");

async function connectWallet() {
  try {
    if (window.ethereum) {
      // 🔸 Metamask
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
    } else {
      // 🔸 WalletConnect
      const wcProvider = new WalletConnectProvider({
        rpc: { [APECHAIN_ID]: "https://rpc.apechain.com" },
      });
      await wcProvider.enable();
      provider = new ethers.providers.Web3Provider(wcProvider);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
    }

    // 🔸 Şəbəkə yoxlaması
    const network = await provider.getNetwork();
    if (network.chainId !== APECHAIN_ID) {
      await provider.send("wallet_addEthereumChain", [{
        chainId: "0x8163",
        chainName: "ApeChain Mainnet",
        nativeCurrency: { name: "APE", symbol: "APE", decimals: 18 },
        rpcUrls: ["https://rpc.apechain.com"],
        blockExplorerUrls: ["https://apescan.io"]
      }]);
    }

    // 🔸 Seaport
    seaport = new Seaport(signer, { contractAddress: PROXY_CONTRACT_ADDRESS });

    connectBtn.style.display = "none";
    disconnectBtn.style.display = "inline-block";
    addrSpan.textContent = userAddress.slice(0, 6) + "..." + userAddress.slice(-4);

    await loadOrders();
  } catch (err) {
    console.error("❌ Wallet qoşulma xətası:", err);
    alert("Cüzdan qoşulmadı! Metamask və ya WalletConnect-i yoxlayın.");
  }
}

async function loadOrders() {
  try {
    const res = await fetch(`${BACKEND_URL}/orders`);
    const data = await res.json();

    marketplaceDiv.innerHTML = "";

    if (!data.success || !data.orders.length) {
      marketplaceDiv.innerHTML = "<p>Hələlik heç bir NFT satışda deyil.</p>";
      return;
    }

    data.orders.forEach(o => {
      const card = document.createElement("div");
      card.className = "nft-card";
      card.innerHTML = `
        <img src="${o.image || 'https://ipfs.io/ipfs/QmExampleNFTImage/1.png'}" alt="NFT">
        <h4>Bear #${o.tokenId}</h4>
        <p>Qiymət: ${o.price} APE</p>
      `;
      marketplaceDiv.appendChild(card);
    });
  } catch (err) {
    console.error("Marketplace yüklənmə xətası:", err);
  }
}

connectBtn.onclick = connectWallet;
disconnectBtn.onclick = () => {
  provider = signer = seaport = userAddress = null;
  connectBtn.style.display = "inline-block";
  disconnectBtn.style.display = "none";
  addrSpan.textContent = "";
  marketplaceDiv.innerHTML = "";
};
