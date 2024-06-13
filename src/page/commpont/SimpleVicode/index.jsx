// VideoCallApp.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

/**
 * Index 组件负责初始化并管理 WebRTC 视频通话功能。
 * 包括设置本地和远程视频流、建立对等连接以及通过 socket.io 处理offer、answer和candidate消息。
 */
function Index() {
    // 创建对本地视频元素的引用
    const localVideoRef = useRef();
    // 创建对远程视频元素的引用
    const remoteVideoRef = useRef();
    // 创建对socket连接的引用
    const socketRef = useRef();
    // 创建对peer连接对象的引用
    const peerConnectionRef = useRef();

    const localStreamRef = useRef();
    const [isConnected, setIsConnected] = useState(false);

    // 使用 useEffect 在组件加载时初始化视频通话环境
    useEffect(() => {
        // 定义服务器URL
        const serverUrl = SERVER_URL;
        // 连接到socket服务器
        socketRef.current = io(serverUrl);

        // 请求用户的音视频流
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                // 将本地视频流显示在本地视频元素中
                localVideoRef.current.srcObject = stream;
                localStreamRef.current = stream; // Keep a reference to the local stream

                // 初始化peer连接的配置信息
                const configuration = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };
                // 创建一个新的RTCPeerConnection实例
                peerConnectionRef.current = new RTCPeerConnection(configuration);

                // 将媒体流的轨道添加到peer连接中
                stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));

                // 设置ICE候选收集的监听器
                peerConnectionRef.current.onicecandidate = event => {
                    if (event.candidate) {
                        socketRef.current.emit('candidate', event.candidate);
                    }
                };

                // 监听远端视频流，将其显示在远程视频元素中
                peerConnectionRef.current.ontrack = event => {
                    remoteVideoRef.current.srcObject = event.streams[0];
                };
            });

        // 注册处理socket事件的回调函数
        socketRef.current.on('offer', handleOffer);
        socketRef.current.on('answer', handleAnswer);
        socketRef.current.on('candidate', handleCandidate);
        socketRef.current.on('leave', handleLeave);

        // 返回清理函数，在组件卸载时断开socket连接
        return () => {
            socketRef.current.disconnect();
            // 如有需要，清理peer连接资源
            hangUp(); // Ensure cleanup on component unmount
        };
    }, []); // 空依赖数组表示此effect只在组件挂载和卸载时执行

    // 处理接收到的offer消息
    const handleOffer = async (offer) => {
        // 设置远程描述为接收到的offer
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        // 创建answer并设置为本地描述
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        // 通过socket发送answer给对方
        socketRef.current.emit('answer', answer);
        setIsConnected(true);
    };

    // 处理接收到的answer消息
    const handleAnswer = async (answer) => {
        // 设置远程描述为接收到的answer
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setIsConnected(true);
    };

    // 处理接收到的ICE候选信息
    const handleCandidate = async (candidate) => {
        // 将ICE候选添加到peer连接中
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handleLeave = () => {
        hangUp();
        // alert('The other user has left the chat.');
    };
    // 发起呼叫的方法
    const callUser = async () => {
        // 创建offer
        const offer = await peerConnectionRef.current.createOffer();
        // 设置本地描述为创建的offer
        await peerConnectionRef.current.setLocalDescription(offer);

        // 通过socket发送offer给对方
        socketRef.current.emit('offer', offer);
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
        setIsConnected(false);
        socketRef.current.emit('leave');  // Notify other peer to clean up as well
    };

    // 渲染本地视频、远程视频及呼叫按钮
    return (
        <div>
            {/* <video autoPlay ref={localVideoRef} /> 本地视频 */}
            {/* <video autoPlay ref={remoteVideoRef} /> 远程视频 */}
            <video autoPlay muted ref={localVideoRef} style={{ display: isConnected ? 'block' : 'none' }} />
            <video autoPlay ref={remoteVideoRef} style={{ display: isConnected ? 'block' : 'none' }} />
            <button onClick={callUser}>呼叫</button> {/* 呼叫按钮 */}
            <button onClick={hangUp}>Hang Up</button>
            {!isConnected && <p>Waiting for connection...</p>}
        </div>
    );
}

export default Index;
