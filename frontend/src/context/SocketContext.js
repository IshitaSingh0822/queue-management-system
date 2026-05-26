import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io('http://localhost:5001', { transports: ['websocket', 'polling'] });

    s.on('connect', () => {
      setConnected(true);
      console.log('Socket connected');
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(s);
    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
