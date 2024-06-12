import React, { useState, useEffect, useLayoutEffect } from 'react'
import { RouterProvider } from 'react-router-dom';
import router from './router';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import WebRTCClient from './WebRTCClient';
// const socketUrl = 'ws://localhost:5000';
// const socketUrl = 'ws://10.10.87.16:5000';

import axios from 'axios';
import Web3 from 'web3';

// 导入HD钱包相关的功能
// import { hdkey } from 'ethereumjs-wallet';
import { ethers } from 'ethers';

import './App.css'
import io from 'socket.io-client';

// const socket = io('http://localhost:5000');
const socketUrl = 'ws://10.10.87.16:5000';
const socket = io(socketUrl);
// 用于WebSocket连接的Infura URL
// const INFURA_WS_URL = 'wss://arbitrum-mainnet.infura.io/ws/v3/b4783fd99e6a48e79b37c9bc1339ab4f';
// const web3Eth = new Web3(new Web3.providers.WebsocketProvider(INFURA_WS_URL));


function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('online');
  const [password, setPassword] = useState('');
  const [helpCode, sethelpCode] = useState("");

  useEffect(() => {
    // const initWeb3 = async () => {
    //   if (window.ethereum) {
    //     const web3 = new Web3(window.ethereum);
    //     try {
    //       // 请求用户授权连接到 MetaMask
    //       await window.ethereum.enable();
    //       // 获取当前活动的账户
    //       const accounts = await web3.eth.getAccounts();
    //       setAccount(accounts[0]);
    //       setWeb3(web3);
    //     } catch (error) {
    //       console.error("User denied account access", error);
    //     }
    //   } else {
    //     console.warn("MetaMask not installed");
    //   }
    // };

    // initWeb3();

    // 生成助记词
    // https://arbitrum-mainnet.infura.io/v3/b4783fd99e6a48e79b37c9bc1339ab4f

    socket.on('chat message', (msg) => {
      setMessages((res) => {
        // console.log(msg,"messages",res);
        return [...res, msg]
      })
      // setMessages([...messages,msg])
    });
    socket.on('sendMsg', (msg) => {
      console.log(msg, "sendMsg");
      setMessages((res) => {
        // console.log(msg,"messages",res);
        return [...res, msg.text]
      })
    });
  }, []);

  // if (!web3) {
  //   return <div>Loading...</div>;
  // }

  const sendMessage = () => {
    if (newMessage !== "") {
      socket.emit('chat message', newMessage);
      setNewMessage('');
    }
  };
  const createWallet = async () => {
    const passwords = "111111";
    // 创建一个随机的钱包实例，包括助记词
    const wallet = ethers.Wallet.createRandom();

    // 获取钱包的助记词
    const mnemonic = wallet.mnemonic.phrase;

    // 获取钱包的私钥
    const privateKey = wallet.privateKey;

    // 获取钱包的公开地址
    const address = wallet.address;

    console.log(`Mnemonic: ${mnemonic}`);
    console.log(`Private Key: ${privateKey}`);
    console.log(`Address: ${address}`);
    console.log(`Password: ${passwords}`)
    //保存到本地加密保存
    const encryptedWallet = await wallet.encrypt(passwords);
    console.log(encryptedWallet);
    //保存到本地存储
    localStorage.setItem('encryptedWallet', encryptedWallet);
    //解密获取地址 助记词 密钥
    const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, passwords);
    //获取助记词
    console.log(decryptedWallet.mnemonic.phrase);
    console.log(decryptedWallet.privateKey);
    console.log(decryptedWallet.address);
    // console.log("++++++++======+++++++s")
    //   // 通过助记词 重置密码
    //   const mnemonics = `suit satisfy practice outside barely force rural foam hawk insane mansion lock`
    //   const newPasswords = "222222";
    //   // 从助记词创建钱包
    //   const wallets = ethers.Wallet.fromPhrase(mnemonics);
    //   const encryptedJsons = await wallets.encrypt(newPasswords);
    //   // 输出钱包地址
    //   console.log('Wallet address:', wallets.address,encryptedJsons,wallets);
    //  //解密获取地址 助记词 密钥
    //  const decryptedWallets = await ethers.Wallet.fromEncryptedJson(encryptedJsons, newPasswords)
  };


  const longing = async () => {
    const encryptedWallet = localStorage.getItem("encryptedWallet")
    try {
      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, "111111");
      //获取助记词
      console.log(decryptedWallet.mnemonic.phrase);
      console.log(decryptedWallet.privateKey);
      console.log(decryptedWallet.address);
      socket.emit('chat ID', decryptedWallet.address);
    } catch (error) {
      window.alert("密码错误")
    }



  }

  const handmnemonicPress = async () => {
    //通过助记词生成钱包实例
    const passwords = "111111"
    if (ethers.Mnemonic.isValidMnemonic(helpCode)) {
      // 从助记词生成 HDNode 对象
      const wallets = ethers.Wallet.fromPhrase(helpCode);
      // 输出钱包地址和私钥
      console.log('钱包地址:', wallets.address);
      console.log('私钥:', wallets.privateKey);
      const encryptedWallet = await wallets.encrypt(passwords);
      console.log(encryptedWallet);
      //保存到本地存储
      localStorage.setItem('encryptedWallet', encryptedWallet);

    }

  };


  //发送私信
  const sendPrivateMessage = async () => {
    socket.emit("sendMsg",{to:"0x58811Cb16384526b29cc0800e68C7b761ae82e9f",text:"你好"})
  };



  // 如果账户已连接，显示应用功能
  return (
    <div className="App">
      <div>
        {
          !localStorage.getItem("encryptedWallet") ? <div>
            <h1>Create Wallet</h1>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={createWallet}>Create Wallet</button>
            助记词:<input value={helpCode} onChange={e => sethelpCode(e.target.value)} />
            <button onClick={handmnemonicPress}>助记词恢复账号</button>
          </div> : null
        }

      </div>
      <h1>Welcome, {account}</h1>
      <h1>Decentralized Chat</h1>
      <button onClick={longing}>登录</button>
      {/* {account.length > 0 && <p>Connected with address: {account[0]}</p>} */}
      <ul style={{ maxHeight: "200px", overflow: "auto" }} >
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        }}
      />
      <button onClick={sendMessage}>Send</button>
      
      <button onClick={sendPrivateMessage}>发送私信</button>
      {/* <WebRTCClient roomId="myRoom" onOfferReceived={handleOfferReceived} /> */}
      {/* 在这里添加你的应用功能 */}
      <RouterProvider router={router} />
    </div>
  );
}

export default App

