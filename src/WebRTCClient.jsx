// src/WebRTCClient.js
import React, { useEffect, useState, useRef } from 'react';

const WebRTCClient = ({ roomId, onOfferReceived }) => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const initPeerConnection = async () => {
      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const pc = new RTCPeerConnection(configuration);
      setPeerConnection(pc);

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (videoRef.current) {
          videoRef.current.srcObject = new MediaStream([
            ...videoRef.current.srcObject.getTracks(),
            ...remoteStream.getTracks(),
          ]);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // 发送 ICE candidate 到信令服务器
        }
      };

      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(localStream);

      // 添加本地流中的所有轨道到 peerConnection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    };

    initPeerConnection();
  }, [roomId]);

  // 确保只在 peerConnection 和 localStream 都存在时添加轨道
  useEffect(() => {
    if (localStream && peerConnection) {
      // 检查每个轨道是否已经被添加
      localStream.getTracks().forEach((track) => {
        if (!peerConnection.getSenders().some((sender) => sender.track === track)) {
          peerConnection.addTrack(track, localStream);
        }
      });
    }
  }, [localStream, peerConnection]);

  const handleOffer = async (offer) => {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    // 发送 answer 到信令服务器
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline></video>
    </div>
  );
};

export default WebRTCClient;
