import {
    ActivityIndicator,
    Alert,
    Dimensions, KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View
} from "react-native";
import {Image} from "expo-image";
import {Button, Input} from "@rneui/themed";
import {useCallback, useState} from "react";
import CloseButton from "../../assets/close.webp"
import axios from "axios";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN} = process.env
import {useFocusEffect} from "@react-navigation/native";
import uuid from 'react-native-uuid'
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import GroupMemberInfoCard from "../../Components/Group/GroupMemberInfo";
import BackButton from "../../Components/Button/BackButton";
import {getUserInfo} from "../../Storage/Storage";

function GroupMembers({route, navigation}) {

    const {userID, groupID} = route.params;
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

    //state for group members
    const [groupMembers, setGroupMembers] = useState([-1]);
    const [adminUser, setAdminUser] = useState("");
    const [token, setToken] = useState("");

        //getting information necessary for page display
     useFocusEffect(
        useCallback(() => {
            getUserInfo(EXPO_PUBLIC_USER_TOKEN).then((info) => {
                if (info) {
                    setToken(info);
                }
            })
            getGroupMembers();
        }, [])
    )

    //get user's list of groups
    function getGroupMembers() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/list-users/${groupID}`
        )
        .then((res) => {
            setGroupMembers(res.data.list);
            setAdminUser(res.data.adminUser);
        })
        .catch((err) => {
            setErrorMessageServer("Something went wrong...");
            setErrorServer(true);
            console.log("CreateGroup page: " + err);
        })
    }

    //API call to check if user is a friend -> invites the friend to the group
    function inviteUser() {
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
                    setInvStatusColor("green");
                }
            }
        ).catch((error) => {
            const {status, data} = error.response;
            if (error.response) {
                if (status !== 500) {
                    setInvStatusMsg(data.errorMessage);
                    setInvStatusColor("red")
                } else {
                    console.log("Group Settings page: " + error);
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                }
            } else {
                console.log("Group Settings page: " + error);
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
            }
        })
    }

    function closeInviteBox() {
        setInvStatusMsg("");
        setInvBoxVisibility(false);
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
                    Alert.alert('Modal has been closed.')
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
                                <Text>Enter the username of the friend you</Text><Text>would like to invite.</Text></View>
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
                <ScrollView>
                    {(groupMembers[0]!== -1) ? groupMembers.map((member) => {
                        return (
                            <View key={uuid.v4()} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginVertical: 5}}
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
        </KeyboardAvoidingView>
    )
}

export default GroupMembers;