import {
    ActivityIndicator,
    Alert,
    Dimensions, KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
    RefreshControl, TouchableOpacity, Share,
} from "react-native";
import {Image} from "expo-image";
import {Button, Input, Switch} from "@rneui/themed";
import React, {useCallback, useContext, useEffect, useState} from "react";
import CloseButton from "../../assets/close.webp"
import axios from "axios";


const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN} = process.env
import {useFocusEffect} from "@react-navigation/native";
import uuid from 'react-native-uuid'
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import GroupMemberInfoCard from "../../Components/Group/GroupMemberInfo";
import BackButton from "../../Components/Button/BackButton";
import {getUserInfo} from "../../Storage/Storage";
import ConfirmPrompt from "../../Components/Prompts/ConfirmPrompt";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import {SocketContext} from "../../Storage/Socket";
import PostComponent from "../../Components/DailyPrompt/PostComponent";
import OtherProfilePicture from "../../Components/Profile/OtherProfilePicture";
import CommentIcon from "../../assets/comment.webp";
import ShareIcon from "../../assets/share.webp";
import OptionsIcon from "../../assets/dotdotdot.webp";

function Memories({route, navigation}) {

    const {username, userID, groupID, token} = route.params;
    const {width, height} = Dimensions.get('window');

    //state for whether the invite box is open or not
    const [invBoxVisible, setInvBoxVisibility] = useState(false);

    //state for the username to be invited to the group
    const [invUser, setInvUser] = useState("");

    //state for group invite status message
    const [invStatusMsg, setInvStatusMsg] = useState("");
    const [invStatusColor, setInvStatusColor] = useState("green");

    //Server error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    // confirm prompt
    const [confirmMessage, setConfirmMessage] = useState('Are you sure you would like to kick this user?');
    const [confirmStatus, setConfirmStatus] = useState(false);

    // info prompt
    const [successMessage, setSuccessMessage] = useState('');
    const [successState, setSuccessState] = useState(false)

    //state for group members
    const [groupMembers, setGroupMembers] = useState([-1]);
    const [adminUser, setAdminUser] = useState("");

    // kick user
    const [kickUser, setKickUser] = useState("")

    const {socket, leaveRoom} = useContext(SocketContext);

    const [refreshPage, applyRefresh] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(0);
    const refreshCooldown = 10000;

    const [prompt, setPrompt] = useState(null);
    const [dailyWinnerPost, setDailyWinnerPost] = useState(null);

    useEffect(() => {
        console.log("memory useEffect");
        getDailyWinner();
    },[]);

    const getDailyWinner = async () => {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-daily-winner`
        )
            .then((res) => {
                const {promptObj, dailyWinnerPostObj} = res.data
                setPrompt(promptObj);
                setDailyWinnerPost(dailyWinnerPostObj);
                console.log("getDaily Winner: ", dailyWinnerPostObj);
            })
        console.log("waht")
    }

    function openComments() {
        navigation.navigate('Comments', {username, userID, groupID, token, postID: dailyWinnerPost._id})
    }

    const onShare = async (itemPictureURL) => {
        try {
            const result = await Share.share({
                url: itemPictureURL,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Share was successful');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share closed ');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
            enabled={false} style={{flex: 1, alignItems: "center"}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginTop: 70,
                marginBottom: 10
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={40} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 55}}>
                    <Text style={{fontSize: 30, fontFamily: 'OpenSansBold'}}>Memories</Text>
                </View>
            </View>

            <View style={{
                width: width * 0.9,
                height: height * 0.15,
                borderRadius: 25,
                borderWidth: 2,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    textAlign: 'center'
                }}>
                    Last Day Winner Post
                </Text>
                {prompt !== null && (
                    <Text style={{
                        fontSize: 20,
                        textAlign: 'center'
                    }}>
                        {prompt.prompt}
                    </Text>
                )}
                {dailyWinnerPost !== null && (
                    <Text style={{
                        fontWeight: 'bold',
                        fontSize: 20,
                        textAlign: 'center'
                    }}>
                        Lst Day Winner: {dailyWinnerPost.owner.username}
                    </Text>
                )}
            </View>

            {dailyWinnerPost !== null && (
                <View style={{
                    height: "100%",
                    borderRadius: 25,
                    marginTop: 20
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                    }}>
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            marginTop: 5,
                            marginBottom: 5,
                            marginLeft: 5,
                            marginRight: 5,
                            gap: 10
                        }}>
                            <OtherProfilePicture size={50} imageUrl={dailyWinnerPost.owner.profilePicture}/>
                            <View style={{flexDirection: 'column'}}>
                                <Text>{dailyWinnerPost.owner.username}</Text>
                                <Text>{new Date(dailyWinnerPost.time).getHours() + ":" + new Date(dailyWinnerPost.time).getMinutes()}</Text>
                            </View>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 5
                            }}>
                                <TouchableOpacity onPress={() => openComments()}>
                                    <Image
                                        source={CommentIcon}
                                        style={{
                                            width: 30,
                                            height: 30,
                                            marginRight: 5
                                        }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onShare(dailyWinnerPost.picture)}>
                                    <Image
                                        source={ShareIcon}
                                        style={{
                                            width: 30,
                                            height: 30
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <Image
                        source={{uri: dailyWinnerPost.picture}}
                        style={{
                            width: width * 0.9 - 10,
                            height: (1.2) * (width * 0.9 - 10),
                        }}
                    />
                </View>
            )}


            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
            <InfoPrompt Message={successMessage} state={successState} setEnable={setSuccessState}></InfoPrompt>
            <ConfirmPrompt Message={confirmMessage} state={confirmStatus} setState={setConfirmStatus}
                           command={() => {
                               setConfirmStatus(false);
                               kickFunc();
                           }}>
            </ConfirmPrompt>
        </KeyboardAvoidingView>
    )
}

export default Memories;
