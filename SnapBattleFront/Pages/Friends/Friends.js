import {View, Image, SafeAreaView, Text, Dimensions, Pressable, TouchableOpacity} from "react-native";
import BackButton from "../../Components/Button/BackButton";
import BlockedFriendsIcon from "../../assets/blocked.webp"
import SearchIcon from "../../assets/search-icon.webp"
import {HeaderTheme} from "../../Theme/Theme";
import {Button, Input} from "@rneui/themed";
import {useCallback, useState} from "react";
import axios from "axios";
import uuid from "react-native-uuid";
import ErrorPrompt from "../../Components/ErrorPrompt";
import {useFocusEffect} from "@react-navigation/native";
import AcceptIcon from "../../assets/check.png"
import RejectIcon from "../../assets/reject.png"
import SettingIcon from "../../assets/profile-setting-icon.webp";

const {EXPO_PUBLIC_API_URL} = process.env

function Friends({route, navigation}) {

    const {name, username, email, userID} = route.params

    const {width, height} = Dimensions.get('window')

    //username to search
    const [search, setSearch] = useState("")

    //server info/error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    //friends {username: ?} and friend requests {username: ?}
    //TODO: add profile pictures
    const [friendReqs, setFriendReqs] = useState([])
    const [friends, setFriends] = useState([])

    function searchUser() {
        console.log('test')
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/search/${search}`,
        )
            .then((res) => {
                console.log(res.data)
                const {searchName, searchUsername, searchEmail, searchBio} = res.data
                navigation.navigate("OtherProfile", {...route.params, ...res.data})
            })
            .catch((err) => {
                console.log(err)
                setErrorMessageServer(err.response.data.errorMessage);
                setErrorServer(true);
            })
    }

    function getFriends() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/get-friends`
        )
            .then((res) => {
                const {friends} = res.data
                setFriends(friends)
            })
            .catch((err) => {
                console.log(err.response.data.errorMessage)
            })
    }

    function getFriendRequests() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/get-requests`
        )
            .then((res) => {
                const {requests} = res.data
                setFriendReqs(requests)
            })
            .catch((err) => {
                console.log(err.response.data.errorMessage)
            })
    }

    function acceptRequest(reqUsername) {
        console.log("accept request")
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/accept`,
            {
                reqUsername: reqUsername
            }
        ).then((res) => {
            const {friends, friendRequests} = res.data
            setFriendReqs(friendRequests)
            setFriends(friends)
        }).catch((err) => {
            console.log(err)
        })
    }

    function denyRequest(reqUsername) {
        console.log("deny request")
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/deny`,
            {
                reqUsername: reqUsername
            }
        ).then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
    }

    useFocusEffect(
        useCallback(() => {
            getFriendRequests()
            getFriends()
        }, [])
    )

    return (
        <SafeAreaView style={{
            alignItems: 'center',
            width: width,
            height: height,
            gap: 20
        }}
        >

            <View style={{flexDirection: 'row', justifyContent: 'center', width: 0.9 * width}}>
                <BackButton size={50} navigation={navigation} destination={"Profile"} params={route.params}/>
                <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={HeaderTheme.h1Style}>Friends</Text>
                </View>
                <Image
                    source={BlockedFriendsIcon}
                    style={{
                        width: 50,
                        height: 50
                    }}
                />
            </View>


            <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center', width: 0.9 * width}}>
                <Input
                    placeholder={"username"}
                    containerStyle={{flex: 1}}
                    onChangeText={username => setSearch(username)}/>
                <TouchableOpacity onPress={searchUser}>
                    <Image
                        source={SearchIcon}
                        style={{
                            width: 50,
                            height: 50
                        }}
                    />
                </TouchableOpacity>
            </View>

            {friendReqs.length !== 0 ?  <View style={{width: width * 0.8}}>
                    <Text style={HeaderTheme.h2Style}>Pending Requests</Text>
                    {friendReqs.map((req) => (
                            <View key={uuid.v4()} style={{flexDirection: 'row', gap: 10}}>
                                <Button buttonStyle={{width: 200}}>@{req.username}</Button>
                                <TouchableOpacity onPress={() => acceptRequest(req.username)}>
                                    <Image
                                        source={AcceptIcon}
                                        style={{
                                            width: 50,
                                            height: 50
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
                        ))
                    }
                </View> : <></>
            }

            <View style={{width: width * 0.8}}>
                <Text style={HeaderTheme.h2Style}>Friends</Text>
                {friends.length !== 0 ?  <View style={{width: width * 0.8}}>
                        {friends.map((friend) => (
                                <View key={uuid.v4()} style={{flexDirection: 'row', gap: 10}}>
                                    <Button buttonStyle={{width: 200}}>@{friend.username}</Button>
                                </View>
                            ))
                        }
                    </View> : <></>
                }
            </View>


            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
        </SafeAreaView>
    )
}

export default Friends