import {createContext, useCallback, useEffect, useState} from "react";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN} = process.env;

import { io } from "socket.io-client";
import {getUserInfo} from "./Storage";

export const SocketContext = createContext();



export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [token, setToken] = useState('');

    useEffect(() => {
        const socketInstance = io(EXPO_PUBLIC_API_URL);
        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};