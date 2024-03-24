import {View, Text,SafeAreaView, KeyboardAvoidingView, Platform, Dimensions, Pressable, TouchableOpacity} from "react-native";
import {Button} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import Logo from "../../assets/logo.webp";
import Chat from "../../assets/chat.webp";
import Camera from "../../assets/camera.webp";
import Group from "../../assets/group.webp";
import {Image} from "expo-image";
import LeaderBoard from '../../assets/Leaderboard.webp';
import DailyPrompt from "../../Components/DailyPrompt/DailyPrompt";
import PostComponent from "../../Components/DailyPrompt/PostComponent";
import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {useFocusEffect} from "@react-navigation/native";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env;

function GroupHome({route, navigation}) {
    const {username, userID, groupID, token} = route.params
    const {width, height} = Dimensions.get('window');

    const [prompt, setPrompt] = useState("")
    const [timeStart, setTimeStart] = useState(new Date())
    const [timeEnd, setTimeEnd] = useState(new Date())
    const [posts, setPosts] = useState([])
    const [camDisabled, setCamDisabled] = useState(true)
    const [camOpacity, setCamOpacity] = useState(0.5)
    //gets the prompt object and underlying post and comment data
    useFocusEffect(
        useCallback(() => {
            axios.get(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-prompt`
            )
                .then((res) => {
                    const {promptObj, submissionAllowed} = res.data
                    if (promptObj === null) {
                        setPrompt("Prompt has not been released yet")
                    }
                    else {
                        setPrompt(promptObj.prompt)
                        setTimeStart(new Date(promptObj.timeStart))
                        setTimeEnd(new Date(promptObj.timeEnd))
                        setPosts(promptObj.posts)
                        setCamDisabled(!submissionAllowed)
                        if (submissionAllowed) {
                            setCamOpacity(1)
                        }
                        else {
                            setCamOpacity(0.5)
                        }
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }, [])
    )

    return (
        <View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: height * 0.15,
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start',
                    width: width * 0.15,
                    paddingBottom: 20,
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{width: width * 0.7, justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={{
                        width: 120,
                        height: 120,
                        top: 15,
                    }} source={Logo}></Image>
                </View>
                <View style={{
                    width: width * 0.15,
                    height: height * 0.1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Image
                        style={{width: '100%', height: '100%'}}
                        source={LeaderBoard}
                        contentFit="contain"
                    />
                </View>
            </View>
            <View style={{
                width: width,
                height: height * 0.18,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <DailyPrompt prompt={prompt} timeStart={timeStart} timeEnd={timeEnd}/>
            </View>
            <View style={{
                width: width,
                alignItems: 'center',
                height: height * 0.55
            }}>
                <PostComponent posts={posts} route={route} navigation={navigation}/>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                height: height * 0.1
            }}>
                <TouchableOpacity onPress={() => navigation.navigate('GroupChat', route.params)}>
                    <Image
                        style={{width: 60, height: 60}}
                        source={Chat}
                        contentFit="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{opacity: camOpacity}}
                    disabled={camDisabled}
                    onPress={() => navigation.navigate('Camera', route.params)}>
                    <Image
                        style={{width: 75, height: 75}}
                        source={Camera}
                        contentFit="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('GroupMembers', route.params)}>
                    <Image
                    style={{width: 60, height: 60}}
                    source={Group}
                    contentFit="contain"
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default GroupHome;