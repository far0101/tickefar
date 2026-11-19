import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

export function useSocket(): Socket {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    socketRef.current = io(import.meta.env.VITE_API_URL as string, {
      autoConnect: true,
    });
  }

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef.current;
}
