import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react'
import socket from './socket'
import myPeer from 'peerjs'

const constraints = {
  audio: true,
  video: true
};


const peer = new myPeer()



function App() {
  const [count, setCount] = useState(0)
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
    function onConnect() {
      console.log("CONETADO MALANDRO!!")
    }

    function onDisconnect() {
      console.log("DESCONETADO MALANDRO!!")
    }


    socket.on('connect', onConnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    peer.on('open', (id) => {
      socket.emit("join-room", '1f63db9a-ec11-4710-9bc4-3901a8e0d9c0', id)
    });

  }, [])


  return (
    <>
      <div className='flex bg-fuchsia-950  '>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <div className="flex">
        <video className='w-96 h-96 m-2' ref={localRef} autoPlay playsInline />
        <video className={`w-96 h-96 m-2 ${remote ? 'block' : 'hidden'}`} ref={remoteRef} autoPlay playsInline />
      </div>
    </>
  )
}

export default App
