/**
 * Friends Component
 *
 * This component renders a page where will allow users to manage their friends. It displays a list of current friends,
 * manages incoming friend requests, and allowing the search and add new friends.
 *
 * @component
 * @return {JSX.Element} A user render for managing friends.
 */

import {
    View,
    Image,
    Text,
    Dimensions,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView, ScrollView
} from "react-native";
import BackButton from "../../Components/Button/BackButton";
import BlockedFriendsIcon from "../../assets/blocked.webp"
import SearchIcon from "../../assets/search-icon.webp"
import {HeaderTheme} from "../../Theme/Theme";
import {Button, Input} from "@rneui/themed";
import {useCallback, useState} from "react";
import axios from "axios";
import uuid from "react-native-uuid";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import {useFocusEffect} from "@react-navigation/native";
import AcceptIcon from "../../assets/check.webp"
import RejectIcon from "../../assets/reject.webp"
import RemoveFriendIcon from "../../assets/close.webp"
import BlockFriendIcon from "../../assets/block.webp"
import SettingIcon from "../../assets/profile-setting-icon.webp";

const {EXPO_PUBLIC_API_URL} = process.env;

function Friends({route, navigation}) {

    const {userID} = route.params;

    const {width, height} = Dimensions.get('window');

    //username to search
    const [search, setSearch] = useState("");

    //server info/error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    //friends {username: ?} and friend requests {username: ?}
    //TODO: add profile pictures
    const [friendReqs, setFriendReqs] = useState([]);
    const [friends, setFriends] = useState([]);

    function searchUser() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/search/${search}`,
        )
            .then((res) => {
                const {searchName, searchUsername, searchBio, viewType, url} = res.data;
                navigation.navigate("OtherProfile", res.data);
            })
            .catch((error) => {
                const {status, data} = error.response;
                if (error.response) {
                    if (status !== 500) {
                        setErrorMessageServer(data.errorMessage);
                        setErrorServer(true);
                    } else {
                        console.log("Friends page: " + error);
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                    }
                } else {
                    console.log("Friends page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            })
    }

    function seeFriend(username, viewType) {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/search/${username}`,
        )
            .then((res) => {
                const {searchName, searchUsername, searchEmail, searchBio} = res.data;
                navigation.navigate("OtherProfile", {...route.params, ...res.data, viewType: viewType});
            })
            .catch((error) => {
                const {status, data} = error.response;
                if (error.response) {
                    if (status !== 500) {
                        setErrorMessageServer(data.errorMessage);
                        setErrorServer(true);
                    } else {
                        console.log("Friends page: " + error);
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                    }
                } else {
                    console.log("Friends page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            })
    }

    function getFriends() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/get-friends`
        )
            .then((res) => {
                const {friends} = res.data;
                setFriends(friends);
            })
            .catch((error) => {
                console.log("Friends page: " + error);
                if (error.response) {
                    setErrorMessageServer(error.response.data.errorMessage);
                    setErrorServer(true);
                }
            })
    }

    function getFriendRequests() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/get-requests`
        )
            .then((res) => {
                const {requests} = res.data;
                setFriendReqs(requests);
            })
            .catch((error) => {
                console.log("Friends page: " + error);
                if (error.response) {
                    setErrorMessageServer(error.response.data.errorMessage);
                    setErrorServer(true);
                }
            })
    }

    function acceptRequest(reqUsername) {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/accept`,
            {
                reqUsername: reqUsername
            }
        ).then((res) => {
            const {friends, friendRequests} = res.data;
            setFriendReqs(friendRequests);
            setFriends(friends);
        }).catch((error) => {
            console.log("Friends page: " + error);
            if (error.response) {
                setErrorMessageServer(error.response.data.errorMessage);
                setErrorServer(true);
            }
        })
    }

    function denyRequest(reqUsername) {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/deny`,
            {
                reqUsername: reqUsername
            }
        ).then((res) => {
            const {requests} = res.data
            setFriendReqs(requests)
        }).catch((error) => {
            console.log("Friends page: " + error);
            if (error.response) {
                setErrorMessageServer(error.response.data.errorMessage);
                setErrorServer(true);
            }
        })
    }

    useFocusEffect(
        useCallback(() => {
            getFriendRequests();
            getFriends();
        }, [])
    )

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                              enabled={false} style={{flex: 1}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: height * 0.2,
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={50} navigation={navigation} />
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{
                        fontSize: 36,
                        fontFamily: 'OpenSansBold'
                    }}>Friends</Text>
                </View>
                <View style={{marginRight: 20}}>
                    <TouchableOpacity onPress={() => {
                    }}>
                        <Image
                            source={BlockedFriendsIcon}
                            style={{
                                width: 50,
                                height: 50
                            }}></Image>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{
                alignItems: 'flex-start',
                flexDirection: "row",
                justifyContent: "flex-start",
            }}>
                <Input containerStyle={{width: width * 0.8}}
                       placeholder={"username"}
                       autoCapitalize="none"
                       onChangeText={username => setSearch(username)}
                />
                <TouchableOpacity style={{marginLeft: 20}} onPress={searchUser}>
                    <Image
                        source={SearchIcon}
                        style={{
                            width: 50,
                            height: 50
                        }}
                    />
                </TouchableOpacity>
            </View>

            {friendReqs.length !== 0 ?
                <View style={{
                    marginLeft: 10,
                    marginBottom: 15
                }}>
                    <Text style={{...HeaderTheme.h2Style, marginBottom: 5}}>Pending Requests</Text>
                    {friendReqs.map((req) => (
                        <View key={uuid.v4()} style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <Button
                                style={{alignItems: 'flex-start'}}
                                buttonStyle={{width: 200}}
                                onPress={() => seeFriend(req.username, 2)}
                            >
                                @{req.username}
                            </Button>
                            <View style={{flexDirection: 'row', alignItems: 'flex-end', marginRight: 10}}>
                                <TouchableOpacity onPress={() => acceptRequest(req.username)}>
                                    <Image
                                        source={AcceptIcon}
                                        style={{
                                            width: 50,
                                            height: 50,
                                            marginRight: 20
                                        }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => denyRequest(req.username)}>
                                    <Image
                                        source={RejectIcon}
                                        style={{
                                            width: 50,
                                            height: 50
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                    }
                </View> : <></>
            }

            <View style={{
                width: width,
                marginLeft: 10,
                flex: 1,
            }}>
                <Text style={{...HeaderTheme.h2Style, marginBottom: 5}}>Friends</Text>
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    {friends.length !== 0 ? <View style={{gap: 10}}>
                        {friends.map((friend) => (
                            <Button key={uuid.v4()}
                                    buttonStyle={{width: 200}}
                                    onPress={() => seeFriend(friend.username, 0)}
                            >
                                @{friend.username}
                            </Button>
                        ))
                        }
                    </View> : <></>
                    }
                </ScrollView>
            </View>


            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
        </KeyboardAvoidingView>
    )
}

export default Friends;