import React, {useState, useCallback, useEffect, useRef} from 'react'
import {Bubble, GiftedChat, InputToolbar, Send} from 'react-native-gifted-chat'
import {getProfileImageCache, getProfilePhoto, setProfileImageCache} from "../../Storage/Cloud";
import {Dimensions, SafeAreaView, View, Text, Pressable, StyleSheet} from "react-native";
import {Image} from 'expo-image';
import BackButton from "../../Components/Button/BackButton";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import ReplyMessageBar from "../../Components/Group/ReplyMessageBar";
import ChatMessageBox from "../../Components/Group/ChatMessageBox";
import default_image_source from '../../assets/default-profile-picture.webp'


export interface IMessage {
    replyMessage?: {
        user: string,
        text: string;
    };
};



function GroupChat({route, navigation}) {
    const [messages, setMessages] = useState(null);
    const {userID, username, groupID} = route.params;
    const [replyMessage, setReplyMessage] = useState(null);
    const {width, height} = Dimensions.get('window');
    const swipeableRowRef = useRef(null);

    useEffect(() => {
        setMessages([
            {
                _id: 11,
                text: 'Test reply ^',
                createdAt: new Date(),
                user: {
                    _id: userID,
                    name: username,
                    avatar: getProfileImageCache(),
                },
                replyMessage: {
                    _id: 1,
                    name: username,
                    text: 'This is the original message being replied to.',
                },
            },
            {
                _id: 10,
                text: 'Check space message ^',
                createdAt: new Date(),
                user: {
                    _id: userID,
                    name: username,
                    avatar: getProfileImageCache(),
                },
            },
            {
                _id: 9,
                text: 'Check space message ^',
                createdAt: new Date(),
                user: {
                    _id: 43434343,
                    name: 'other user name',
                    avatar: getProfileImageCache(),
                },
            },
            {
                _id: 8,
                text: 'Breh!',
                createdAt: new Date(),
                user: {
                    _id: 585885,
                    name: 'other user name 2',
                    avatar: default_image_source,
                },
                replyMessage: {
                    _id: 3,
                    name: 'other user name',
                    text: 'OMG :)',
                },
            },
            {
                _id: 7,
                text: 'user 3',
                createdAt: new Date(),
                user: {
                    _id: 585885,
                    name: 'other user name 2',
                    avatar: default_image_source,
                },
            },
            {
                _id: 6,
                text: 'test reply space ^',
                createdAt: new Date(),
                user: {
                    _id: userID,
                    name: username,
                    avatar: getProfileImageCache(),
                },
            },
            {
                _id: 5,
                text: 'Uhm...',
                createdAt: new Date(),
                user: {
                    _id: userID,
                    name: username,
                    avatar: getProfileImageCache(),
                },
                replyMessage: {
                    _id: 3,
                    name: 'other user name',
                    text: 'OMG :)',
                },
            },
            {
                _id: 4,
                text: 'test reply space ^',
                createdAt: new Date(),
                user: {
                    _id: 43434343,
                    name: 'other user name',
                    avatar: getProfileImageCache(),
                },
            },
            {
                _id: 3,
                text: 'OMG :)',
                createdAt: new Date(),
                user: {
                    _id: 43434343, //OTHER USER
                    name: 'other user name',
                    avatar: getProfileImageCache(),
                },
                replyMessage: {
                    _id: 1,
                    name: username,
                    text: 'This is the original message being replied to.',
                },
            },
            {
                _id: 2,
                text: 'Hello people :)',
                createdAt: new Date(),
                user: {
                    _id: userID,
                    name: username,
                    avatar: getProfileImageCache(),
                },
            },
            {
                _id: 1,
                text: 'This is the original message being replied to.',
                createdAt: new Date(),
                user: {
                    _id: userID,
                    name: username,
                    avatar: getProfileImageCache(),
                },
            },
        ])
    }, [])

    useEffect(() => {
        if (replyMessage && swipeableRowRef.current) {
            swipeableRowRef.current.close();
            swipeableRowRef.current = null;
        }
    }, [replyMessage]);


    const updateRowRef = useCallback(
        (ref: any) => {
            if (ref && replyMessage && ref.props.children.props.currentMessage?._id === replyMessage._id) {
                swipeableRowRef.current = ref;
            }
        },
        [replyMessage]
    );


    const onSend = useCallback((messages = []) => {
        if (replyMessage) {
            messages[0].replyMessage = { text: replyMessage.text };
        }
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        setReplyMessage(null);
    }, [replyMessage]);


    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: height * 0.1,
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={{
                        width: 120,
                        height: 120,
                        top: 10,
                    }} source={require('../../assets/logo.webp')}></Image>
                </View>
                <View style={{marginRight: 10,}}>
                    <Pressable
                        onPress={() => navigation.navigate("Profile",
                            {
                                userID: userID
                            })}>
                        <ProfilePicture size={50} userID={userID}/>
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
                    }}
                    onSend={messages => onSend(messages)}

                    renderCustomView={props => {
                        if (props.currentMessage && props.currentMessage.replyMessage) {
                            const isMessageFromCurrentUser = props.currentMessage.user._id === props.user._id;
                            const fontColorMessage = isMessageFromCurrentUser ? '#ffffff' : '#000000';
                            const fontColorUser = isMessageFromCurrentUser ? '#ff8800' : '#2196F3';
                            const backgroundColor = isMessageFromCurrentUser ? 'rgba(3,51,10,0.79)' : '#ECECEC';
                            const borderLeftColor = isMessageFromCurrentUser ? '#ff8800': '#2196F3';
                            const isMyName = username === props.currentMessage.replyMessage.name;
                            const replyName = isMyName ? 'You' : props.currentMessage.replyMessage.name;
                            return (
                                <View style={{
                                    marginTop: 2,
                                    paddingRight: 10,
                                    paddingVertical: 5,
                                    borderRadius: 5,
                                    height: 50
                                }}>
                                    <View style={{
                                        borderLeftWidth: 2,
                                        marginLeft: 6,
                                        paddingLeft: 6,
                                        width: '100%',
                                        borderLeftColor: borderLeftColor,
                                        backgroundColor: backgroundColor,
                                        borderRadius: 5,
                                        //height: '100%',
                                        flex: 1,
                                    }}>
                                        <Text style={{color: fontColorUser, fontWeight: 'bold'}}>{replyName}</Text>
                                        <Text style={{fontSize: 12, color: fontColorMessage}}>{props.currentMessage.replyMessage.text}</Text>
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
                        return (

                            <InputToolbar {...props}
                                          containerStyle={{
                                              flexDirection: 'column-reverse',
                                              alignContent: 'center',
                                              justifyContent: 'center',
                                              borderRadius: 30,
                                              marginRight: 60,
                                              marginLeft: 5,
                                              marginBottom: 5
                                          }}
                                          accessoryStyle={{height: 'auto'}}
                            >
                            </InputToolbar>

                        )
                    }}

                    messagesContainerStyle={{
                        paddingBottom: 0
                    }}

                    renderAccessory={ props => {
                        return (
                            <ReplyMessageBar {...props} message={replyMessage} clearReply={() => setReplyMessage(null)} />
                        )
                    }}

                    renderMessage={props => {
                        return (
                            <ChatMessageBox {...props} setReplyOnSwipeOpen={setReplyMessage} updateRowRef={updateRowRef}/>
                        )
                    }}
                />
            </View>
        </SafeAreaView>
    )
}



export default GroupChat;