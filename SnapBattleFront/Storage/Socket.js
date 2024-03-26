import React, {createContext, useCallback, useEffect, useState} from "react";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN} = process.env;

import { io } from "socket.io-client";
import {getUserInfo} from "./Storage";
import {useNavigation} from "@react-navigation/native";
import InfoPrompt from "../Components/Prompts/InfoPrompt";

export const SocketContext = createContext();



export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [infoMessage, setInfoMessage] = useState("")
    const [infoState, setInfoState] = useState(false)

    const navigation = useNavigation();

    useEffect(() => {
        const socketInstance = io(EXPO_PUBLIC_API_URL);
        setSocket(socketInstance);

        socketInstance.on("groupHome", (updateDetails) => {
            if (updateDetails.kicked === true) {
                console.log(updateDetails);
                setInfoState(true);
                setInfoMessage("You have been kicked from the group.");
                socketInstance.emit('groupHome', updateDetails.userID, "leave", updateDetails.groupID);
                setTimeout(() => {
                    navigation.navigate("Main", {userID:  updateDetails.userID})
                }, 1000)
            }
        })

        return () => {
            socketInstance.disconnect();
        };
    }, [navigation]);

    const joinRoom = (token, groupID) => {
        if (socket && groupID) {
            socket.emit('groupHome', token, "update", groupID);
        }
    };


    // Leave a group room
    const leaveRoom = (token, groupID) => {
        if (socket) {
            socket.emit('groupHome', token, "leave", groupID);
            socket.off('groupHome');
        }
    };

    return (
        <SocketContext.Provider value={{socket, joinRoom, leaveRoom}}>
            {children}
            <InfoPrompt Message={infoMessage} state={infoState} setEnable={setInfoState}></InfoPrompt>
        </SocketContext.Provider>
    );
};