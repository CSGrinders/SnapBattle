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

import {useCallback, useState} from "react";
import {
    Dimensions,
    Pressable,
    Text,
    View,
    Image,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import PlusButton from "../../assets/plus.webp";
import LeaveButton from "../../assets/leave.webp";
import axios from "axios";
import uuid from 'react-native-uuid';
import {Button} from "@rneui/themed";
import {useFocusEffect} from "@react-navigation/native";
import {getUserInfo} from "../../Storage/Storage";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env;

function Groups({navigation}) {

    //user information
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [userID, setUserID] = useState('');
    const [token, setToken] = useState('');

    //groups are in format [{groupID: ?, name: ?}, ...]
    const [groups, setGroups] = useState([-1]);
    const [groupInvites, setGroupInvites] = useState(["test1", "test2", "test3", "test4"]);
    const {width, height} = Dimensions.get('window');

    //Server error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    //getting user information
    useFocusEffect(
        useCallback(() => {
            getUserInfo(EXPO_PUBLIC_USER_INFO).then((info) => {
                if (info) {
                    const userData = JSON.parse(info);
                    if (userData.name) setName(userData.name);
                    if (userData.username) setUsername(userData.username);
                    if (userData.email) setEmail(userData.email);
                    if (userData.id) setUserID(userData.id);
                }
            })
            getUserInfo(EXPO_PUBLIC_USER_TOKEN).then((info) => {
                if (info) {
                    setToken(info);
                }
            })
        }, [])
    )

    //getting information necessary for page display
    useFocusEffect(
        useCallback(() => {
            getGroups()
        }, [userID])
    );


    //get user's list of groups
    function getGroups() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups`
        )
            .then((res) => {
                setGroups(res.data)
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
                                name: name,
                                username: username,
                                email: email,
                                userID: userID
                            })}>
                        <ProfilePicture size={50}/>
                    </Pressable>
                </View>
            </View>

            <View style={{
                height: height * 0.15,
                marginLeft: 10,
            }}>
                <Text style={{fontSize: 24, fontFamily: "OpenSansBold"}}>Pending Requests</Text>
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    {groupInvites.map((group) => {
                        return (
                            <Text key={uuid.v4()}>{group}</Text>
                        )
                    })}
                </ScrollView>
            </View>


            <View style={{
                marginLeft: 10,
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
                                        name: name,
                                        username: username,
                                        email: email,
                                        userID: userID,
                                        groupID: group.groupID
                                    })}
                                >
                                    {group.name}
                                </Button>
                                <Pressable style={{marginRight: 10}}>
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
                    }) : <ActivityIndicator size="large" color="#000000"/>}
                </ScrollView>
            </View>


            <View style={{
                position: 'absolute',
                bottom: 20,
                alignSelf: 'center',
                alignItems: 'center'
            }}>
                <Pressable style={{alignItems: 'center'}}
                           onPress={() => navigation.navigate("CreateGroup", {userID: userID})}>
                    <Image
                        source={PlusButton}
                        style={{
                            width: 50,
                            height: 50
                        }}
                    />
                    <Text style={{fontFamily: "OpenSansRegular"}}>Create Group</Text>
                </Pressable>
            </View>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
        </View>
    )
}

export default Groups;