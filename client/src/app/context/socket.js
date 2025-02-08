import io from 'socket.io-client';
import { useEffect, createContext, useContext, useState } from 'react';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const user = localStorage.getItem('user');

  useEffect(() => {
    if (!socket) {
      const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
        withCredentials: true,
        query: { user },
        reconnection: true,
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsSocketConnected(true);
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsSocketConnected(false);
      });

      newSocket.on('getAllOnlineUsers', (data) => {
        console.log('Received online users:', data);
      });

      return () => {
        console.log('Cleaning up socket connection');
        if (newSocket) {
          newSocket.off('connect');
          newSocket.off('connect_error');
          newSocket.off('getAllOnlineUsers');
          newSocket.disconnect();
          setSocket(null);
          setIsSocketConnected(false);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsSocketConnected(false);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setIsSocketConnected(true);
      });

      return () => {
        socket.off('disconnect');
        socket.off('reconnect');
      };
    }
  }, [socket]);

  if (!isSocketConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-2">Connecting to server...</div>
          <div className="text-sm text-gray-500">Please wait while we establish connection</div>
        </div>
      </div>
    );
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
