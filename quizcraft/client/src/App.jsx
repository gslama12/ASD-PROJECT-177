import LoginComponent from './components/UIComponents/LoginComponent.jsx';
import HomeComponent from './components/UIComponents/HomeComponent.jsx';
import {Route, Routes, Navigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import io from "socket.io-client";

const WEBSOCKET_URL = "http://localhost:3001";

function App() {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(WEBSOCKET_URL);
        setSocket(newSocket);
        return () => newSocket.close();
    }, [setSocket]);

    if (!socket) return <div>Loading...</div>;

  return (
      <>
        <Routes>
            <Route path='/' element={<Navigate to="/login" />} />
            <Route path='/home' element={<HomeComponent socket={socket} />} />
            <Route path='/login' element={<LoginComponent socket={socket}/>} />
        </Routes>
      </>
  );
}

export default App;
