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
    RefreshControl,
} from "react-native";
import {Image} from "expo-image";
import {Button, Input} from "@rneui/themed";
import {useCallback, useContext, useState} from "react";
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

function GroupMembers({route, navigation}) {

    const {userID, groupID, token} = route.params;
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

    const onRefresh = useCallback(() => {
        const now = Date.now();
        if (now - lastRefresh < refreshCooldown) {
            console.log('Refresh cooldown is active. ');
            return;
        }

        setRefreshing(true);
        getGroupMembers()
            .finally(() => {
                setRefreshing(false);
                setLastRefresh(Date.now());
            });
    }, [lastRefresh]);

    //getting information necessary for page display
    useFocusEffect(
        useCallback(() => {
            getGroupMembers();

        }, [])
    )

    //get user's list of groups
    function getGroupMembers() {
        return axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/list-users`
        )
            .then((res) => {
                setGroupMembers(res.data.list);
                console.log("Admin user:", res.data.adminUser)
                setAdminUser(res.data.adminUser);
            })
            .catch((err) => {
                console.log("Members Home page: " + err);
                if (err && err.response) {
                    const {data, status} = err.response;
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                    if (status === 404) {
                        leaveRoom(userID, groupID);
                        setTimeout(() => {
                            navigation.navigate("Main", {userID: userID})
                        }, 1500)
                    }
                }
            })
    }

    //API call to check if user is a friend -> invites the friend to the group
    function inviteUser() {
        if (invUser === '') {
            setInvStatusMsg('Empty field.');
            setInvStatusColor("red");
            return;
        }
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/invite`,
            {
                inviteUsername: invUser
            }
        ).then(
            (res) => {
                const message = res.data.message;
                if (message) {
                    setInvStatusMsg(message);
                    setInvUser('');
                    setInvStatusColor("green");
                }
            }
        ).catch((error) => {
            if (error && error.response) {
                const {status, data} = error.response;
                if (status !== 500) {
                    setInvStatusMsg(data.errorMessage);
                    setInvStatusColor("red")
                    setInvUser('');
                } else {
                    console.log("Group Settings page: " + error);
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                    setInvUser('');
                }
            } else {
                console.log("Group Settings page: " + error);
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
                setInvUser('');
            }
        })
    }

    function closeInviteBox() {
        setInvStatusMsg("");
        setInvBoxVisibility(false);
    }


    function kickFunc() {
        axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/kick-user`, {
            kickUsername: kickUser
        }).then((response) => {
            let {userKicked} = response.data;
            setGroupMembers(groupMembers.filter(member => member.username !== kickUser));
            if (userKicked) {
                setSuccessState(true);
                setSuccessMessage(kickUser + " has ben kicked successfully.");
            }
        }).catch((error) => {
            console.log("Group member page: " + error)
            if (error && error.response) {
                let {status, data} = error.response;
                if (status === 404) {
                    setGroupMembers(groupMembers.filter(member => member.username !== kickUser));
                }
                setErrorServer(true);
                setErrorMessageServer(data.errorMessage);
            }
        })
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            enabled={false} style={{flex: 1, alignItems: "center"}}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={invBoxVisible}
                onRequestClose={() => {
                    setInvBoxVisibility(false)
                    setInvStatusMsg("")
                }}>
                <View style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderColor: 'black',
                        borderWidth: 2,
                        borderRadius: 8,
                        padding: 10,
                    }}>
                        <Pressable onPress={closeInviteBox}>
                            <Image
                                source={CloseButton}
                                style={{
                                    width: 30,
                                    height: 30,
                                    marginLeft: 'auto',
                                }}
                                rcontentFit="cover"
                                transition={500}
                            />
                        </Pressable>
                        <View style={{
                            flex: 0,
                            alignItems: 'center'
                        }}>
                            <View style={{alignItems: 'center', justifyContent: 'center', marginBottom: 10}}>
                                <Text>Enter the username of the friend you</Text><Text>would like to
                                invite.</Text></View>
                            <Input
                                placeholder='username'
                                onChangeText={username => setInvUser(username)}
                                errorStyle={{color: invStatusColor}}
                                errorMessage={invStatusMsg}
                                autoCapitalize="none"
                            />
                            <Button onPress={inviteUser}>Confirm</Button>
                        </View>
                    </View>
                </View>
            </Modal>

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
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 20}}>
                    <Text style={{fontSize: 32, fontFamily: 'OpenSansBold'}}>Group Members</Text>
                </View>
            </View>

            <View style={{
                width: width,
                flex: 1
            }}>
                <ScrollView contentContainerStyle={{flex: 1}}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }>
                    {(groupMembers[0] !== -1) ? groupMembers.map((member) => {
                        return (
                            <View key={uuid.v4()} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginVertical: 5
                            }}
                            >
                                <GroupMemberInfoCard
                                    navigation={navigation}
                                    groupID={groupID}
                                    userID={userID}
                                    searchName={member.name}
                                    searchUsername={member.username}
                                    searchID={member._id}
                                    pfpURL={member.profilePicture}
                                    width={width * 0.84}
                                    isAdmin={adminUser === member._id}
                                    token={token}
                                    setError={setErrorServer}
                                    setErrorMessage={setErrorMessageServer}
                                    adminPerms={adminUser === userID ? (adminUser !== member._id) : false}
                                    setSuccess={successState}
                                    setSuccessMessage={setSuccessMessage}
                                    setKickUser={setKickUser}
                                    setKick={setConfirmStatus}
                                />
                            </View>
                        )
                    }) : <ActivityIndicator size="large" color="#000000"/>}
                </ScrollView>
            </View>
            <View style={{
                marginTop: 20,
                marginBottom: 20
            }}>
                <Button onPress={() => setInvBoxVisibility(true)}>Invite +</Button>
            </View>
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

export default GroupMembers;
