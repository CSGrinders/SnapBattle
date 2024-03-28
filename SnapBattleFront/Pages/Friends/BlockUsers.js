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
    KeyboardAvoidingView, ScrollView, RefreshControl
} from "react-native";
import BackButton from "../../Components/Button/BackButton";
import BlockedFriendsIcon from "../../assets/blocked.webp"
import SearchIcon from "../../assets/search-icon.webp"
import {HeaderTheme} from "../../Theme/Theme";
import {Button, Input} from "@rneui/themed";
import {useCallback, useContext, useEffect, useState} from "react";
import axios from "axios";
import uuid from "react-native-uuid";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import {useFocusEffect} from "@react-navigation/native";
import AcceptIcon from "../../assets/check.webp"
import RejectIcon from "../../assets/reject.webp"
import {SocketContext} from "../../Storage/Socket";
import {getUserInfo} from "../../Storage/Storage";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN} = process.env;

function BlockUsers({route, navigation}) {

    const {userID, token} = route.params;

    const {width, height} = Dimensions.get('window');

    //username to search
    const [search, setSearch] = useState("");

    //server info/error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    //friends {username: ?} and friend requests {username: ?}
    //TODO: add profile pictures
    const [userList, setUserList] = useState([]);
    const [friends, setFriends] = useState([]);
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
        getUsersBlocked()
            .finally(() => {
                setRefreshing(false);
                setLastRefresh(Date.now());
            });
    }, [lastRefresh]);


    function getUsersBlocked() {
        return axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/get-blocked`
        )
            .then((res) => {
                const {users, requests} = res.data;
                setUserList(users);
            })
            .catch((error) => {
                console.log("Block page: " + error);
                const {data, status} = error.response;
                if (error.response) {
                    setErrorMessageServer(error.response.data.errorMessage);
                    setErrorServer(true);
                }
            })
    }


    useFocusEffect(
        useCallback(() => {
            getUsersBlocked();
        }, [])
    )

    function seeUser(username, viewType) {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/search/${username}`,
        )
            .then((res) => {
                navigation.navigate("OtherProfile", {...res.data, ...route.params, token: token});
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
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginRight: 40}}>
                    <Text style={{
                        fontSize: 36,
                        fontFamily: 'OpenSansBold'
                    }}>Block User List</Text>
                </View>
            </View>
            {userList.length !== 0 ?
                <Text style={{...HeaderTheme.h2Style, marginLeft: 10, marginBottom: 5}}>Users</Text> : <></>}
            <ScrollView
                contentContainerStyle={{flex: 1}}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={{
                    width: width,
                    marginLeft: 10,
                    flex: 1,
                }}>
                    <ScrollView contentContainerStyle={{flexGrow: 1}}>
                        {userList.length !== 0 ?
                            <View style={{gap: 10}}>
                                {userList.map((userBlock) => (
                                    <Button key={uuid.v4()}
                                            buttonStyle={{width: 200}}
                                            onPress={() => seeUser(userBlock.username, 0)}
                                    >
                                        @{userBlock.username}
                                    </Button>
                                ))
                                }
                            </View> : <>
                                <View style={{
                                    flex: 0.2,
                                    justifyContent: 'center',
                                    height: height * 0.5,
                                    alignItems: 'center',
                                }}>
                                    <Text style={{
                                        paddingRight: 25,
                                        color: 'grey',
                                        fontWeight: 'bold',
                                        fontSize: 25,
                                    }}>No blocked Users</Text>
                                </View>
                            </>
                        }
                    </ScrollView>
                </View>
            </ScrollView>


            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
        </KeyboardAvoidingView>
    )
}

export default BlockUsers;