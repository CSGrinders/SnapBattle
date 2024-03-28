import React, {useState, useCallback, useEffect, useRef, useContext} from 'react'
import {Bubble, GiftedChat, InputToolbar, Send} from 'react-native-gifted-chat'
import {getProfileImageCache, getProfilePhoto, setProfileImageCache} from "../../Storage/Cloud";
import {Dimensions, SafeAreaView, View, Text, Pressable, StyleSheet, Keyboard} from "react-native";
import {Image} from 'expo-image';
import BackButton from "../../Components/Button/BackButton";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import ReplyMessageBar from "../../Components/Group/ReplyMessageBar";
import ChatMessageBox from "../../Components/Group/ChatMessageBox";
import {useFocusEffect} from "@react-navigation/native";
import axios from "axios";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import {SocketContext} from "../../Storage/Socket";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_DEFAULT_PROFILE_PICTURE_URL} = process.env;


function GroupChat({route, navigation}) {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [messages, setMessages] = useState([]);
    const {userID, username, groupID, token} = route.params;
    const [replyMessage, setReplyMessage] = useState(null);
    const {width, height} = Dimensions.get('window');
    const swipeableRowRef = useRef(null);
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);
    const [avatar, setAvatar] = useState("");
    const {socket, leaveRoom} = useContext(SocketContext);
    const [successMessage, setSuccessMessage] = useState('');
    const [successState, setSuccessState] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let avatar_img = getProfileImageCache();
            if (avatar_img === 'default') {
                setAvatar(EXPO_PUBLIC_DEFAULT_PROFILE_PICTURE_URL);
            } else {
                setAvatar(avatar_img);
            }
            axios.get(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/getChat`,
            )
                .then((res) => {
                    const {isEmpty, messages} = res.data;
                    if (!isEmpty && messages) {
                        setMessages(messages);
                    } else {
                        setMessages([]);
                    }
                })
                .catch((err) => {
                    console.log("Group Home page: " + err);
                    const {data} = err.response;
                    if (err.response) {
                        setErrorMessageServer(data.errorMessage);
                        setErrorServer(true);
                        leaveRoom(userID, groupID);
                        setTimeout(() => {
                            navigation.navigate("Main", {userID: userID})
                        }, 1500)
                    }
                })


        }, [userID, EXPO_PUBLIC_DEFAULT_PROFILE_PICTURE_URL, EXPO_PUBLIC_API_URL, groupID])
    );


    useEffect(() => {
        // Listen for keyboard events
        const keyboardWillShowListener = Keyboard.addListener(
            'keyboardWillShow',
            () => setKeyboardVisible(true),
        );
        const keyboardWillHideListener = Keyboard.addListener(
            'keyboardWillHide',
            () => setKeyboardVisible(false),
        );

        // Cleanup
        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);


    useFocusEffect(
        useCallback(() => {
            const handleMessageReceived = (newMessage) => {
                setMessages(previousMessages => GiftedChat.append(previousMessages, newMessage));
            };

            socket.on("message", handleMessageReceived);

            return () => {
                socket.off("message", handleMessageReceived);
            };
        }, [socket])
    );

    useEffect(() => {
        if (replyMessage && swipeableRowRef.current) {
            swipeableRowRef.current.close();
            swipeableRowRef.current = null;
        }
    }, [replyMessage]);


    const updateRowRef = useCallback(
        (ref) => {
            if (ref && replyMessage && ref.props.children.props.currentMessage?._id === replyMessage._id) {
                swipeableRowRef.current = ref;
            }
        },
        [replyMessage]
    );


    const onSend = useCallback((messages = []) => {
        if (replyMessage) {
            messages[0].replyMessage = {name: replyMessage.user.name, text: replyMessage.text};
        }
        socket.emit('sendMessage', messages[0], groupID);
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        setReplyMessage(null);
        return () => {
            socket.off('sendMessage');
        };
    }, [replyMessage, socket, groupID]);


    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: height * 0.09,
            }}>
                <View style={{
                    paddingLeft: 15,
                    paddingBottom: 5,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={{
                        width: 120,
                        height: 120,
                        top: 5,
                    }} source={require('../../assets/logo.webp')}></Image>
                </View>
                <View style={{marginRight: 10,}}>
                    <Pressable
                        onPress={() => navigation.navigate("Profile",
                            {
                                userID: userID
                            })}>
                        <ProfilePicture size={50} userID={userID} currentUserID={userID}/>
                    </Pressable>
                </View>
            </View>
            <View style={{flex: 1}}>
                <GiftedChat
                    renderUsernameOnMessage={true}
                    alwaysShowSend={true}
                    wrapInSafeArea={true}
                    messages={messages}
                    user={{
                        _id: userID,
                        name: username,
                        avatar: avatar,
                    }}
                    onSend={messages => onSend(messages)}

                    renderCustomView={props => {
                        if (props.currentMessage && props.currentMessage.replyMessage) {
                            const isMessageFromCurrentUser = props.currentMessage.user._id === props.user._id;
                            const fontColorMessage = isMessageFromCurrentUser ? '#ffffff' : '#000000';
                            const fontColorUser = isMessageFromCurrentUser ? '#ff8800' : '#2196F3';
                            const backgroundColor = isMessageFromCurrentUser ? 'rgba(3,51,10,0.79)' : '#ECECEC';
                            const borderLeftColor = isMessageFromCurrentUser ? '#ff8800' : '#2196F3';
                            const isMyName = username === props.currentMessage.replyMessage.name;
                            const replyName = isMyName ? 'You' : props.currentMessage.replyMessage.name;
                            return (
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    marginTop: 2,
                                    paddingRight: 5,
                                    paddingVertical: 5,
                                    borderRadius: 5,
                                }}>
                                    <View style={{
                                        borderLeftWidth: 2,
                                        //width: '100%',
                                        marginLeft: 6,
                                        paddingTop: 6,
                                        paddingLeft: 6,
                                        paddingRight: 6,
                                        //width: '100%',
                                        borderLeftColor: borderLeftColor,
                                        backgroundColor: backgroundColor,
                                        borderRadius: 5,
                                        height: '100%',
                                        flexGrow: 1,
                                    }}>
                                        <Text style={{color: fontColorUser, fontWeight: 'bold'}}>{replyName}</Text>
                                        <Text style={{
                                            fontSize: 12,
                                            color: fontColorMessage,
                                            paddingBottom: 5,
                                            paddingRight: 6
                                        }}>{props.currentMessage.replyMessage.text}</Text>
                                    </View>
                                </View>
                            );
                        }
                        return null;
                    }}
                    renderBubble={props => {
                        const currentMessage = props.currentMessage;
                        const previousMessage = props.previousMessage;
                        const hasReply = !!currentMessage.replyMessage;
                        const currentUserId = currentMessage.user ? currentMessage.user._id : null;
                        const previousUserId = previousMessage && previousMessage.user ? previousMessage.user._id : null;
                        const isPreviousMessageFromSameUser = currentUserId && previousUserId && currentUserId === previousUserId;
                        const extraTopSpace = hasReply && !isPreviousMessageFromSameUser ? 10 : 0;
                        return (
                            <Bubble
                                {...props}
                                wrapperStyle={{
                                    right: {
                                        backgroundColor: '#056e16',
                                        marginTop: extraTopSpace,
                                    },
                                    left: {
                                        backgroundColor: '#e6e6e6',
                                        marginTop: extraTopSpace,
                                    }
                                }}
                            />
                        )
                    }}
                    renderSend={
                        props => {
                            return (
                                <Send {...props}>
                                    <View {...props} style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: 45,
                                        width: 45,
                                        borderRadius: 50,
                                        left: 110
                                    }}>
                                        <Image style={{
                                            width: 50,
                                            height: 50,
                                            left: 4,
                                        }} source={require('../../assets/sendMessage.webp')}></Image>
                                    </View>
                                </Send>
                            )
                        }}
                    renderInputToolbar={props => {
                        const replyHeight = keyboardVisible ? 50 : 'auto';
                        return (
                            <InputToolbar {...props}
                                          containerStyle={{
                                              flexDirection: 'column-reverse',
                                              alignContent: 'center',
                                              justifyContent: 'center',
                                              borderRadius: 30,
                                              marginRight: 60,
                                              marginLeft: 5,
                                              marginTop: 5,
                                          }}
                                          accessoryStyle={{height: replyHeight}}
                            >
                            </InputToolbar>

                        )
                    }}

                    messagesContainerStyle={{
                        paddingBottom: 0
                    }}

                    renderAccessory={props => {
                        return (
                            <ReplyMessageBar {...props} message={replyMessage}
                                             clearReply={() => setReplyMessage(null)}/>
                        )
                    }}

                    renderMessage={props => {
                        return (
                            <ChatMessageBox {...props} setReplyOnSwipeOpen={setReplyMessage}
                                            updateRowRef={updateRowRef}/>
                        )
                    }}
                />
            </View>
            <InfoPrompt Message={successMessage} state={successState} setEnable={setSuccessState}></InfoPrompt>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
        </SafeAreaView>
    )
}


export default GroupChat;