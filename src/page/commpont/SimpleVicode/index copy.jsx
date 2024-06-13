// VideoCallApp.js
import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import Peer from 'simple-peer';
// import Peer from '../../../../node_modules/simple-peer/simple-peer.js';
// import Peer from 'simple-peer';


// const SERVER_URL = 'http://localhost:5000';

function Index() {
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [isCaller, setIsCaller] = useState(false);

    const userVideo = useRef();
    const partnerVideo = useRef();
    const socket = useRef(); // Placeholder for signal data exchange mechanism
    const peerRef = useRef();
    const p = new SimplePeer({
        // initiator: location.hash === '#1',
        // trickle: false
        initiator: true,
        trickle: false,
        stream: stream,
    })
    console.log(p);


    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // WebRTC支持
            // Request user media (camera and microphone)
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                setStream(stream);
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }
            });
        } else {
            console.warn('WebRTC is not supported in this browser.');
        }

        // Here you would set up the signaling logic using websockets, socket.io, or any other method
        // For the sake of this example, we'll simulate receiving a call with a button click
    }, []);
    console.log(stream);
    p.on('signal', (data) => {
        // Here you would send the signal data to the peer via your chosen signaling method
        console.log("Caller Signal Data:", data);
      });
    // console.log(Peer);
    //   const [stream, setStream] = useState();
    //   const [receivingCall, setReceivingCall] = useState(false);
    //   const [caller, setCaller] = useState("");
    //   const [callerSignal, setCallerSignal] = useState();
    //   const [callAccepted, setCallAccepted] = useState(false);

    //   const userVideo = useRef();
    //   const partnerVideo = useRef();
    //   const socket = useRef();
    //   const peerRef = useRef();

    //   useEffect(() => {
    //     socket.current = io(SERVER_URL);
    //     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    //       setStream(stream);
    //       if (userVideo.current) {
    //         userVideo.current.srcObject = stream;
    //       }
    //     });

    //     socket.current.on('room_joined', id => {
    //       console.log('New user joined:', id);
    //     });

    //     socket.current.on('signal', data => {
    //       setReceivingCall(true);
    //       setCaller(data.by);
    //       setCallerSignal(data.signal);
    //     });

    //     return () => socket.current.disconnect();
    //   }, []);

    //   function callUser(id) {
    //     const peer = new Peer({
    //       initiator: true,
    //       trickle: false,
    //       stream: stream,
    //     });

    //     peer.on('signal', signal => {
    //       socket.current.emit('signal', { to: id, signal: signal });
    //     });

    //     peer.on('stream', currentStream => {
    //       if (partnerVideo.current) {
    //         partnerVideo.current.srcObject = currentStream;
    //       }
    //     });

    //     socket.current.on('callAccepted', signal => {
    //       setCallAccepted(true);
    //       peer.signal(signal);
    //     });

    //     peerRef.current = peer;
    //   }

    //   function acceptCall() {
    //     setCallAccepted(true);
    //     const peer = new Peer({
    //       initiator: false,
    //       trickle: false,
    //       stream: stream,
    //     });

    //     peer.on('signal', signal => {
    //       socket.current.emit('acceptCall', { signal, to: caller });
    //     });

    //     peer.on('stream', currentStream => {
    //       partnerVideo.current.srcObject = currentStream;
    //     });

    //     peer.signal(callerSignal);
    //     peerRef.current = peer;
    //   }

      let UserVideo;
      if (stream) {
        UserVideo = (
          <video playsInline muted ref={userVideo} autoPlay style={{ width: "300px" }} />
        );
      }

      let PartnerVideo;
      if (callAccepted) {
        PartnerVideo = (
          <video playsInline ref={partnerVideo} autoPlay style={{ width: "300px" }} />
        );
      }

    //   let incomingCall;
    //   if (receivingCall) {
    //     incomingCall = (
    //       <div>
    //         <h1>{caller} is calling you</h1>
    //         <button onClick={acceptCall}>Accept</button>
    //       </div>
    //     );
    //   }
      return (
        <div>
          {UserVideo}
          {PartnerVideo}
          {/* {incomingCall} */}
        </div>
      );
}

export default Index;
