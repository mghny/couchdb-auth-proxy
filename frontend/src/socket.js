import { createContext, useContext, useEffect, useRef } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef();

  if (!socketRef.current) {
    socketRef.current = io("http://localhost:8080");
  }

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (eventName, callback) => {
  const socket = useContext(SocketContext);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const handlerRef = useRef(function () {
    if (callbackRef.current) {
      callbackRef.current.apply(this, arguments);
    }
  });

  const subscribe = () => {
    if (eventName) {
      socket.on(eventName, handlerRef.current);
    }
  };

  const unsubscribe = () => {
    if (eventName) {
      socket.off(eventName, handlerRef.current);
    }
  };

  useEffect(() => {
    subscribe();

    return () => unsubscribe();
  }, [eventName]);

  return { socket, unsubscribe, subscribe };
};
