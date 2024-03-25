/**
 * OtherProfile Component
 *
 * This component displays the profile details of other users.
 *
 * viewType = 0 -> other user is a friend
 * viewType = 1 -> other user is not a friend & no pending requests
 * viewType = 2 -> other user is a pending friend
 *
 * @component
 * @return {JSX.Element} Renders a view of other users' profiles.
 */

import {Dimensions, Text, View} from "react-native";
import {Button} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import {useCallback, useContext, useState} from "react";
import axios from "axios";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import OtherProfilePicture from "../../Components/Profile/OtherProfilePicture";
import {useFocusEffect} from "@react-navigation/native";
import {getUserInfo} from "../../Storage/Storage";
import {SocketContext} from "../../Storage/Socket";
import ConfirmPrompt from "../../Components/Prompts/ConfirmPrompt";
const {EXPO_PUBLIC_API_URL} = process.env;

function OtherProfile({route, navigation}) {
    const {width, height} = Dimensions.get('window'); //Get dimensions of the screen for footer

    const {searchName, searchUsername, searchBio, viewType, url, requestExists, userID, token} = route.params;
    const socket = useContext(SocketContext);

    const [image, setImage] = useState('');

    const [existRqFriend, setExistRqFriend] = useState(requestExists);
    const [view, setView] = useState(viewType);

    //Server error
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    const [infoMessage, setInfoMessage] = useState('');
    const [infoPrompt, setInfoPrompt] = useState(false);

    const [confirmMessage, setConfirmMessage] = useState('Are you sure? You will leave all groups with this user in it.');
    const [confirmStatus, setConfirmStatus] = useState(false);

    function sendFriendRequest() {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/send-request`,
            {
                receivingUsername: searchUsername
            }
        ).then((res) => {
            setInfoPrompt(true);
            setExistRqFriend(true);
            setInfoMessage(res.data.message);
        }).catch((error) => {
            const {status, data} = error.response;
            if (error.response) {
                if (status !== 500) {
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                    setTimeout(() => {
                        navigation.navigate("Friends", {userID})
                    }, 1000)
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

    useFocusEffect(
        useCallback(() => {
            socket.emit("otherProfile", token, "otherprofile");
            socket.on("otherProfile", (updateDetails) => {
                console.log(updateDetails);
                if (updateDetails.type === "exitProfile") {
                    navigation.navigate("Friends", {userID: userID});
                } else if (updateDetails.type === "otherAccept") {
                    console.log("New other profile update: " + updateDetails.updateDetails);
                    setView(updateDetails.updateDetails);
                } else if (updateDetails.type === "otherDeny") {
                    console.log("New other profile update: " + updateDetails.updateDetails);
                    setExistRqFriend(updateDetails.updateDetails);
                }
            });
            return () => {
                socket.off('otherProfile');
                socket.emit('otherProfile', userID, "leaveOther");
            };
        }, [])
    )

    function removeRequest() {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/remove-request`,
            {
                usernameReq: searchUsername,
            },
        ).then((response) => {
            const {data} = response.data;
            setExistRqFriend(data);
        }).catch((err) => {
            if (err.response.status !== 500) {
                setErrorMessageServer(err.response.data.errorMessage);
                setErrorServer(true);
                setTimeout(() => {
                    navigation.navigate("Friends", {userID})
                }, 1000);
            } else {
                setErrorMessageServer(err.response.data.errorMessage);
                setErrorServer(true);
            }
        })
    }

    function removeFriend(username) {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/remove`,
            {
                removeUsername: username
            }
        ).then((res) => {
            setInfoPrompt(true);
            setInfoMessage(res.data.message);
            setView(1);
            setExistRqFriend(false);
            setTimeout(() => {
                navigation.navigate("Friends", {userID})
            }, 1000)
        })
        .catch((err) => {
            if (err.response.status !== 500) {
                setErrorMessageServer(err.response.data.errorMessage);
                setErrorServer(true);
                setTimeout(() => {
                    navigation.navigate("Friends", {userID})
                }, 1000)
            } else {
                setErrorMessageServer(err.response.data.errorMessage);
                setErrorServer(true);
            }
        })
    }

    function blockFriend(username) {
        // removing as friend/removing request based on current relationship w user
        if (view === 0) {
            // copy and pasted bc i don't want it to show confirmation on success
            axios.post(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/remove`,
                {
                    removeUsername: username
                }
            ).then((res) => {
                setView(1);
                setExistRqFriend(false);
            })
                .catch((err) => {
                    if (err.response.status !== 500) {
                        setErrorMessageServer(err.response.data.errorMessage);
                        setErrorServer(true);
                        setTimeout(() => {
                            navigation.navigate("Friends", {userID})
                        }, 1000)
                    } else {
                        setErrorMessageServer(err.response.data.errorMessage);
                        setErrorServer(true);
                    }
                })
            console.log("remove friend")
        } else {
            if (existRqFriend) {
                removeRequest();
                console.log("remove request")
            }
        }
        console.log("here")
        // leaving all groups with user in it
        axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/friends/block`, {
                blockUsername: username
            }
        ).then((res) => {
            const success = res.data;
            console.log("blocked")
            if (success) {
                setInfoMessage("User blocked. You have left all the groups that you share with this user.")
                setInfoPrompt(true);
                setTimeout(() => {
                    navigation.navigate("Groups", {userID})
                }, 2000)
            }
        }).catch((error) => {
            let {status, data} = error;
            console.log(status)
            setErrorMessageServer(data.errorMessage);
            setErrorServer(true);
        })
    }

    return (
        <View style={{flex: 1}}>
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
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: height * 0.15,
            }}>
                <OtherProfilePicture size={150} imageUrl={url}/>
                <Text style={{fontWeight: 'bold', fontSize: 24}}>{searchName}</Text>
                <Text>@{searchUsername}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                height: height * 0.25,
                width: width * 0.9,
                marginLeft: 15
            }}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 25,
                }}>Biography</Text>
                <Text>{searchBio}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.9,
                marginLeft: 15
            }}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 24,
                }}>Achievements</Text>
                <Text>Winner x2</Text>
            </View>


            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: width,
                height: height * 0.5,
                gap: 10
            }}>
                {view === 0 ?
                    <>
                        <Button onPress={() => removeFriend(searchUsername)}>
                            Remove Friend
                        </Button>
                        <Button onPress={() => setConfirmStatus(true)}>
                            Block Friend
                        </Button>
                    </>
                    :
                    <></>
                }
                {view === 1 ?
                    (existRqFriend ?
                        <>
                            <Button
                                onPress={removeRequest}>
                                Remove Friend Request
                            </Button>
                            <Button onPress={() => setConfirmStatus(true)}>
                                Block User
                            </Button>
                        </>
                        :
                        <>
                            <Button
                                onPress={sendFriendRequest}>
                                Send Friend Request
                            </Button>
                            <Button onPress={() => setConfirmStatus(true)}>
                                Block User
                            </Button>
                    </>)
                    :
                    <></>
                }
            </View>
            <InfoPrompt Message={infoMessage} state={infoPrompt} setEnable={setInfoPrompt}/>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}/>
            <ConfirmPrompt Message={confirmMessage} state={confirmStatus} setState={setConfirmStatus}
                           command={() => {
                               setConfirmStatus(false);
                               blockFriend(searchUsername)
                           }}>
            </ConfirmPrompt>
        </View>
    )
}

export default OtherProfile;