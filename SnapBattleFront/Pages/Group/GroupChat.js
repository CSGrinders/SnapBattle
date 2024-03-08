import React, {useState, useCallback, useEffect} from 'react'
import {Bubble, Composer, GiftedChat, InputToolbar, Message, Send} from 'react-native-gifted-chat'
import {getProfileImageCache, getProfilePhoto, setProfileImageCache} from "../../Storage/Cloud";
import {Dimensions, SafeAreaView, View, Text} from "react-native";
import {Image} from 'expo-image';

function GroupChat({route, navigation}) {
    const [messages, setMessages] = useState([])
    const {userID, username, groupID} = route.params;
    const {width, height} = Dimensions.get('window');

    useEffect(() => {
        setMessages([
            {
                _id: userID,
                text: 'TEST :)',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'Another user name',
                    avatar: getProfileImageCache(),
                },
            },
        ])
    }, [])





    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages),
        )
    }, [])



    return (
        <SafeAreaView style={{flex: 1}}>
            <GiftedChat
                renderUsernameOnMessage={true}
                alwaysShowSend={true}
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: userID,
                }}
                renderBubble={props => {
                    return (
                        <Bubble
                            {...props}
                            wrapperStyle={{
                                right: {
                                    backgroundColor: '#0084ff',
                                },
                                left: {
                                    backgroundColor: '#e6e6e6',
                                }
                            }}
                            textStyle={{
                                right: {
                                    color: '#fff',
                                },
                                left: {
                                    color: '#000',
                                }
                            }}
                        />
                    )
                }}
                renderSend={
                    props=>{
                        return(
                            <Send {...props}>
                                <View {...props} style={{flexDirection:'row',
                                    justifyContent:'center',
                                    alignItems:'center',
                                    height:45,
                                    width:45,
                                    borderRadius:50,
                                    left:110}} >
                                    <Image style={{
                                        width: 50,
                                        height: 50,
                                        left: 4,
                                    }} source={require('../../assets/send-icon.webp')}></Image>
                                </View>
                            </Send>
                        )
                    }}


                renderInputToolbar={props=>{
                    return(

                        <InputToolbar {...props}
                                      containerStyle={{
                                          alignContent: 'center',
                                          justifyContent: 'center',
                                          borderRadius:30,
                                          marginRight:60,
                                          marginLeft:5,
                                          marginBottom:5}}>
                        </InputToolbar>

                    )
                }}
                messagesContainerStyle={{
                    paddingBottom:20
            }}
            />
        </SafeAreaView>
    )
}


export default GroupChat;