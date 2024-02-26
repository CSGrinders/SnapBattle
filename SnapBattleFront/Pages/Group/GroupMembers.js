import {ActivityIndicator, Alert, Dimensions, Modal, Pressable, SafeAreaView, ScrollView, Text, View} from "react-native";
import {Image} from "expo-image";
import {Button, Input} from "@rneui/themed";
import {useCallback, useState} from "react";
import CloseButton from "../../assets/close.webp"
import axios from "axios";
const {EXPO_PUBLIC_API_URL} = process.env
import BackIcon from "../../assets/back-icon.webp";
import {useFocusEffect} from "@react-navigation/native";
import uuid from 'react-native-uuid'
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";

function GroupMembers({route, navigation}) {

    const {name, username, email, userID, groupID} = route.params;
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

        //getting information necessary for page display
     useFocusEffect(
        useCallback(() => {
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
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between'}} >

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
                                <Text>Enter the username of the friend you would like to invite</Text>
                                <Input
                                    placeholder='username'
                                    onChangeText={username => setInvUser(username)}
                                    errorStyle={{color: invStatusColor}}
                                    errorMessage={invStatusMsg}
                                />
                                <Button onPress={inviteUser}>Confirm</Button>
                            </View>
                        </View>
                    </View>
                </Modal>


                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    height: height * 0.2,
                    width: width * 0.9,
                }}>
                    <Pressable
                        style={{ paddingLeft: 20, alignItems: "flex-start" }}
                        onPress={() => navigation.navigate("Groups")}
                    >
                        <Image source={BackIcon} style={{ width: 50, height: 50 }}></Image>
                    </Pressable>
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingRight: 20,
                    }}
                    >
                        <Text style={{ fontSize: 36 }}>Group Members</Text>
                    </View>
                </View>


                <View style={{
                    width: width * 0.8,
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
                                <Button
                                    buttonStyle={{width: 300}}
                                    onPress={() => navigation.navigate("Profile", {name: member.name, username: member.username, email: member.email, userID: member._id})}
                                >
                                    {member.username}
                                </Button>
                            </View>
                        )
                    }) : <ActivityIndicator size="large" color="#000000"/>}
                </ScrollView>
            </View>

                <Button onPress={() => setInvBoxVisibility(true)}>Invite +</Button>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
        </SafeAreaView>
    )
}

export default GroupMembers;