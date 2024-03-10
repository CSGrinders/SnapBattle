import React, {useState, useCallback, useEffect} from 'react'
import {Bubble, GiftedChat, InputToolbar, Send} from 'react-native-gifted-chat'
import {getProfileImageCache, getProfilePhoto, setProfileImageCache} from "../../Storage/Cloud";
import {Dimensions, SafeAreaView, View, Text, Pressable} from "react-native";
import {Image} from 'expo-image';
import BackButton from "../../Components/Button/BackButton";
import ProfilePicture from "../../Components/Profile/ProfilePicture";

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
                                              alignContent: 'center',
                                              justifyContent: 'center',
                                              borderRadius: 30,
                                              marginRight: 60,
                                              marginLeft: 5,
                                              marginBottom: 5
                                          }}>
                            </InputToolbar>

                        )
                    }}
                    messagesContainerStyle={{
                        paddingBottom: 20
                    }}
                />
            </View>
        </SafeAreaView>
    )
}


export default GroupChat;