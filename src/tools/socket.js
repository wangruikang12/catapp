import io from 'socket.io-client';
const wsUrl = import.meta.env.VITE_WS_URL;
//获取打包模式
const mode = import.meta.env.MODE;

console.log(wsUrl,mode);

const socketUrl = mode == "production" ? wsUrl : 'ws://10.10.87.16:5000';

const socket = io(socketUrl);

export default socket;
