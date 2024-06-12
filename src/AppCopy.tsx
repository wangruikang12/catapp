import React,{ useState,useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import WebRTCClient from './WebRTCClient';
const socketUrl = 'ws://localhost:5000';
const socket = new WebSocket(socketUrl);
import axios from 'axios';
import Web3 from 'web3';
import './App.css'

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  // const [localStream, setLocalStream] = useState(null);
  // const [remoteStream, setRemoteStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('online');

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // 请求用户授权连接到 MetaMask
          await window.ethereum.enable();
          // 获取当前活动的账户
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
          setWeb3(web3);
        } catch (error) {
          console.error("User denied account access", error);
        }
      } else {
        console.warn("MetaMask not installed");
      }
    };

    initWeb3();
  }, []);


  useEffect(() => {
    // navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
    //   setLocalStream(stream);
    // });

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'offer' || data.type === 'answer') {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data));
      } else if (data.type === 'candidate') {
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else if (data.type === 'message') {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      } else if (data.type === 'status') {
        setStatus(data.status);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  if (!web3) {
    return <div>Loading...</div>;
  }

  const handleOfferReceived = (offer) => {
    console.log(offer);
    
    // 处理接收到的 offer
  };
  // const handleOffer = (offer) => {
  //   peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  //   peerConnection.createAnswer().then((answer) => {
  //     peerConnection.setLocalDescription(answer);
  //     socket.send(JSON.stringify({ type: 'answer', answer }));
  //   });
  // };

  // const handleCandidate = (candidate) => {
  //   peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  // };

  const sendMessage = () => {
    socket.send(JSON.stringify({ type: 'message', message: newMessage }));
    setNewMessage('');
  };

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    socket.send(JSON.stringify({ type: 'status', status: newStatus }));
  };

  // 如果账户已连接，显示应用功能
  return (
    <div className="App">
      <h1>Welcome, {account}</h1>
      {/* <WebRTCClient roomId="myRoom" onOfferReceived={handleOfferReceived} /> */}
      {/* 在这里添加你的应用功能 */}
      <div>
        <h3>Chat Messages:</h3>
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
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
      <div>
        <p>Status: {status}</p>
        <button onClick={() => updateStatus('online')}>Online</button>
        <button onClick={() => updateStatus('offline')}>Offline</button>
      </div>
    </div>
  );
}

export default App

