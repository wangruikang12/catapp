// VideoChat.js
import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import './VideoChat.css';
import { Button } from 'antd-mobile';
import { useContext } from 'react';
import { GlobalStateContext } from '../../../data/GlobalStateContext';
import socket from '../../../tools/socket';

const VideoChat = ({ onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { state, updateState } = useContext(GlobalStateContext);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();
  const draggableRef = useRef();
  const address = localStorage.getItem('Address');


  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;

        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        peerConnectionRef.current = new RTCPeerConnection(configuration);

        stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));

        peerConnectionRef.current.onicecandidate = event => {
          if (event.candidate) {
            socket.emit('candidate', event.candidate);
          }
        };

        peerConnectionRef.current.ontrack = event => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };
      });

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('candidate', handleCandidate);
    socket.on('leave', handleLeave);

    return () => {
      // socket.disconnect();
      socket.off('offer');
      socket.off('answer');
      socket.off('candidate');
      socket.off('leave');
      hangUp();
    };
  }, []);


  const handleOffer = async (offer) => {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    const msg = {
      type: 'videoChat',
      frome: address,
      to: state.chatId,
      msg: "answer",
      answer,
      date: new Date().toISOString(),
    }
    socket.emit('answer', msg);
    // setIsConnected(true);
  };

  const handleAnswer = async (answer) => {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    // setIsConnected(true);
  };

  const handleCandidate = async (candidate) => {
    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleLeave = () => {
    hangUp();
    // alert('The other user has left the chat.');
  };

  const callUser = async () => {

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    // socket.emit('offer', offer);
    const msg = {
      type: 'videoChat',
      frome: address,
      to: state.chatId,
      msg: "offer",
      offer,
      date: new Date().toISOString(),
    }
    socket.emit('offer', msg);

  };

  const hangUp = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
    const msg = {
      type: 'videoChat',
      frome: address,
      to: state.chatId,
      msg: "leave",
      date: new Date().toISOString(),
    }
    socket.emit('leave', msg)
    onClose();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prevState => !prevState);
    // 重置 Draggable 组件的位置
    if (!isFullScreen) {
      draggableRef.current.setState({ x: 0, y: 0 });
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(prevState => !prevState);
  };

  return (
    <Draggable cancel=".controls" disabled={isFullScreen} ref={draggableRef}>
      <div className={`video-chat-window ${isFullScreen ? 'fullscreen' : ''} ${isMinimized ? 'minimized' : ''}`}>
        <div className="video-container">
          <div className={`${isMuted ? 'video-smal' : 'video-big'}`}  >
            <video autoPlay muted ref={localVideoRef} />
          </div>
          <div className={`controls ${isMuted ? 'video-big' : ' video-smal'}`} onClick={() => setIsMuted(prevState => !prevState)}>
            <video autoPlay ref={remoteVideoRef} />
          </div>
        </div>
        <div className="controls">
          {state.callInitiator ? null : <button onClick={callUser}>拨通</button>}
          <button onClick={hangUp}>挂断</button>
          <button onClick={toggleFullScreen}>{isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
          <button onClick={toggleMinimize}>{isMinimized ? 'Expand' : 'Minimize'}</button>
        </div>
      </div>
    </Draggable>)



};

export default VideoChat;
