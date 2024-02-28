/**
 * Groups Component
 *
 * This component renders the main group page for users to interact with groups. It displays a list of groups
 * the user is a member of, pending group invites, and gives navigation options to enter to a group page,
 * manage profile, and create new groups.
 *
 * @component
 * @return {JSX.Element} Renders the main groups.
 */

import {useCallback, useContext, useEffect, useLayoutEffect, useReducer, useState} from "react";
import {
    Dimensions,
    Pressable,
    Text,
    View,
    Image,
    ScrollView,
    ActivityIndicator, TouchableOpacity,
} from "react-native";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import PlusButton from "../../assets/plus.webp";
import LeaveButton from "../../assets/leave.webp";
import AcceptButton from "../../assets/check.webp"
import RejectButton from "../../assets/close.webp"
import axios from "axios";
import uuid from 'react-native-uuid';
import {Button} from "@rneui/themed";
import {useFocusEffect} from "@react-navigation/native";
import {deleteUserInfo, getUserInfo} from "../../Storage/Storage";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import ConfirmPrompt from "../../Components/Prompts/ConfirmPrompt";
import socket, {SocketContext} from "../../Storage/Socket";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env;

function Groups({navigation}) {

    //user information
    const [userID, setUserID] = useState('');
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('')

    //groups are in format [{groupID: ?, name: ?}, ...]
    const [groups, setGroups] = useState([-1]);
    const [groupInvites, setGroupInvites] = useState([-1]);
    const {width, height} = Dimensions.get('window');

    //Server error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);


    const [infoMessage, setInfoMessage] = useState('');
    const [infoPrompt, setInfoPrompt] = useState(false);

    const [confirm, setConfirm] = useState(false);
    const [confirmGroup, setConfirmGroup] = useState('');
    const [confirmStatus, setConfirmStatus] = useState('');

    const [refresh, applyRefresh] = useState(false);
    const socket = useContext(SocketContext);
    const [createdGroup, setCreatedGroup] = useState(false);


    //getting user information
    useFocusEffect(
        useCallback(() => {
            getGroups();
            getUserInfo(EXPO_PUBLIC_USER_INFO).then((info) => {
                if (info) {
                    setUserID(info);
                }
            })
            getUserInfo(EXPO_PUBLIC_USER_TOKEN).then((info) => {
                if (info) {
                    socket.emit("groupUpdate", info, "groupsMain", null);
                    setToken(info);
                }
            })

            socket.on("groupUpdate", (updateDetails) => {
                if (updateDetails.type === "groupInvite") {
                    console.log("New group invite received:", updateDetails.updateDetails.groupInvites);
                    setGroupInvites(updateDetails.updateDetails.groupInvites);
                } else if (updateDetails.type === "groups") {
                    if (updateDetails.updateDetails.groups != null) {
                        console.log("New groups update: " + JSON.stringify(updateDetails.updateDetails.groups));
                        setGroups(updateDetails.updateDetails.groups);
                    } else {
                        setGroups([-1]);
                    }
                }
            });

            return () => {
                socket.off('groupUpdate');
            };
        }, [userID])
    )


    //get user's list of groups and the user's pending group invites
    function getGroups() {
        if (!userID) return
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups`
        )
            .then((res) => {
                const {username, invites, groups} = res.data;
                setUsername(username)
                setGroups(groups);
                setGroupInvites(invites);
            })
            .catch((error) => {
                const {status, data} = error.response;
                if (error.response) {
                    if (status !== 500) {
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                    } else {
                        console.log("Main Group page: " + error);
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                    }
                } else {
                    console.log("Main Group page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            });
    }

    function acceptGroupInvite(groupID) {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/acceptInvite`
        ).then(res => {
            const {invites, groups} = res.data
            setGroups(groups)
            setGroupInvites(invites)
        }).catch(error => {
            const {status, data} = error.response;
            if (error.response) {
                if (status !== 500) {
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                } else {
                    console.log("Main Group page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            } else {
                console.log("Main Group page: " + error);
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
            }
        })
    }

    function rejectGroupInvite(groupID) {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/rejectInvite`
        ).then(res => {
            const {invites, groups} = res.data
            setGroups(groups)
            setGroupInvites(invites)
        }).catch(error => {
            const {status, data} = error.response;
            if (error.response) {
                if (status !== 500) {
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                } else {
                    console.log("Main Group page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            } else {
                console.log("Main Group page: " + error);
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
            }
        })
    }

    function leaveGroup(groupID) {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/leave-group`
        )
            .then((res) => {
                setGroups(res.data.groups);
                setInfoPrompt(true);
                setInfoMessage("You left the group.");
            })
            .catch((error) => {
                const {status, data} = error.response;
                if (error.response) {
                    if (status !== 500) {
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                    } else {
                        console.log("Main Group page: " + error);
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                    }
                } else {
                    console.log("Main Group page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            })
    }

    return (
        <View style={{flex: 1}}>
            <View style={{
                flex: 0,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: height * 0.2,
            }}>
                <View>
                    <Text style={{
                        fontSize: 40,
                        fontFamily: 'OpenSansBold',
                        marginLeft: 10,
                    }}>Groups</Text>
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
            {groupInvites.length !== 0 ?
            <View style={{
                height: height * 0.15,
                marginLeft: 10,
                flex: 0
            }}>
                <Text style={{fontSize: 24, fontFamily: "OpenSansBold"}}>Pending Requests</Text>
                <ScrollView contentContainerStyle={{flexGrow: 1}} key={refresh}>
                    {(groupInvites[0] !== -1) ? groupInvites.map((group) => {
                        return (
                            <View key={uuid.v4()} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginVertical: 5
                            }}
                            >
                                <Button buttonStyle={{width: 200}}>
                                    {group.name}
                                </Button>
                                <TouchableOpacity
                                    style={{marginRight: 10}}
                                    onPress={() => acceptGroupInvite(group.groupID)}
                                >
                                    <Image
                                        source={AcceptButton}
                                        style={{
                                            width: 50,
                                            height: 50
                                        }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{marginRight: 10}}
                                    onPress={() => rejectGroupInvite(group.groupID)}
                                >
                                    <Image
                                        source={RejectButton}
                                        style={{
                                            width: 50,
                                            height: 50
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        )
                    }) : <ActivityIndicator size="large" color="#000000"/>}
                </ScrollView>
            </View> : <></> }

            <View style={{
                marginLeft: 10,
                flex: 1
            }}>
                <Text style={{fontSize: 24, fontFamily: "OpenSansBold"}}>Groups</Text>
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    {(groups[0] !== -1) ? groups.map((group) => {
                        return (
                            <View key={uuid.v4()} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginVertical: 5
                            }}
                            >
                                <Button
                                    buttonStyle={{width: 200}}
                                    onPress={() => navigation.navigate("GroupHome", {
                                        userID: userID,
                                        groupID: group.groupID,
                                        username: username
                                    })}
                                >
                                    {group.name}
                                </Button>
                                <Pressable style={{marginRight: 10}} onPress={() => {
                                    setConfirm(true);
                                    setConfirmStatus("Are you sure?");
                                    setConfirmGroup(group.groupID);
                                }}>
                                    <Image
                                        source={LeaveButton}
                                        style={{
                                            width: 50,
                                            height: 50
                                        }}
                                    />
                                </Pressable>
                            </View>
                        )
                    }) : (errorServer && <ActivityIndicator size="large" color="#000000"/>)}
                </ScrollView>
            </View>


            <View style={{
                position: 'absolute',
                bottom: 20,
                alignSelf: 'center',
                alignItems: 'center'
            }}>
                <TouchableOpacity style={{alignItems: 'center'}}
                                  onPress={() => navigation.navigate("CreateGroup", {userID: userID})}>
                    <Image
                        source={PlusButton}
                        style={{
                            width: 50,
                            height: 50
                        }}
                    />
                    <Text style={{fontFamily: "OpenSansRegular"}}>Create Group</Text>
                </TouchableOpacity>
            </View>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
            <InfoPrompt Message={infoMessage} state={infoPrompt} setEnable={setInfoPrompt}></InfoPrompt>
            <ConfirmPrompt Message={confirmStatus} state={confirm} setState={setConfirm}
                           command={() => {
                               setConfirm(false);
                               leaveGroup(confirmGroup);
                           }}></ConfirmPrompt>
        </View>
    )
}

export default Groups;