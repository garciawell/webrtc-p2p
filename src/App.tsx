import Peer from 'peerjs'
import React, { useEffect, useState } from 'react'
import './App.css'
import socket from './socket'

const constraints = {
  audio: true,
  video: true
};
 

const peer = new Peer({
  host: '/',
  port: 3000,
  path: '/peerjs'
});



function App() {
  const localRef = React.useRef<HTMLVideoElement>(null);
  const remoteRef = React.useRef<HTMLVideoElement>(null);
  const [remote, setRemote] = useState(false);



  async function getUserMedia(constraints: MediaStreamConstraints) {
    let stream = null;
    try {
      const video = await navigator.mediaDevices.getUserMedia(constraints);
      stream = video
    } catch (err) {
      console.log(err)
      stream = null
    }
    return stream
  }

  function connectToNewUser(userId: string, stream: MediaStream) {
    const call = peer.call(userId, stream)
    call.on('stream', (userVideoStream) => {
      if (remoteRef.current) remoteRef.current.srcObject = userVideoStream
      setRemote(true);
    })
  }


  useEffect(() => {
    getUserMedia(constraints).then((stream) => {
      if (localRef.current) localRef.current.srcObject = stream;

      peer.on('call', (call) => {
        call.answer(stream!)
        call.on('stream', (userVideoStream) => {
          if (remoteRef.current) remoteRef.current.srcObject = userVideoStream
          setRemote(true);
        })
      })

      socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream!)
      })

      socket.on('user-disconnected', (userId) => {
        console.log("user-disconnected", userId)
        setRemote(false);
      })

    }
    )
  }, [])

  useEffect(() => {
    peer.on('open', (id) => {
      socket.emit("join-room", '1f63db9a-ec11-4710-9bc4-3901a8e0d9c0', id)
    });

  }, [])


  return (
    <>
      <h1 className='font-bold'>Videoconferência POC</h1>

      <div className="flex justify-center mt-8">
        <video className='local w-2/4 h-[450px] m-2' ref={localRef} autoPlay playsInline />
        <video className={`remote w-2/4 h-[450px] m-2 ${remote ? 'block' : 'hidden'}`} ref={remoteRef} autoPlay playsInline />
      </div>
    </>
  )
}

export default App
