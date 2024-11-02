import { io } from 'socket.io-client';

const socket = io("wss://concrete-kelly-garcia-2cd3d48b.koyeb.app/", {
    reconnectionDelayMax: 10000,
});


export default socket