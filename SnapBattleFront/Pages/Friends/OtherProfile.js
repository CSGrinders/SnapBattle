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
import {useState} from "react";
import axios from "axios";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import OtherProfilePicture from "../../Components/Profile/OtherProfilePicture";
const {EXPO_PUBLIC_API_URL} = process.env

function OtherProfile({route, navigation}) {
    const {width, height} = Dimensions.get('window'); //Get dimensions of the screen for footer

    const {searchName, searchUsername, searchBio, viewType, url} = route.params;


    const [image, setImage] = useState('');

    //Server error
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    const [infoMessage, setInfoMessage] = useState('');
    const [infoPrompt, setInfoPrompt] = useState(false);

    function sendFriendRequest() {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/send-request`,
            {
                receivingUsername: searchUsername
            }
        ).then((res) => {
            setInfoPrompt(true);
            setInfoMessage(res.data.message);
        }).catch((error) => {
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

    function removeFriend(username) {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/friends/remove`,
            {
                removeUsername: username
            }
        ).then((res) => {
            setInfoPrompt(true);
            setInfoMessage(res.data.message);
            setTimeout(() => {
                navigation.navigate("Friends", {name: name, username: username, email: email, userID: userID})
            }, 1000)
        })
        .catch((err) => {
            setErrorMessageServer(err.response.data.errorMessage);
            setErrorServer(true);
        })
    }

    function blockFriend() {
        console.log("block friend")
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
                {viewType === 0 ?
                    <>
                        <Button onPress={() => removeFriend(searchUsername)}>
                            Remove Friend
                        </Button>
                        <Button onPress={() => blockFriend(searchUsername)}>
                            Block Friend
                        </Button>
                    </>
                    :
                    <></>
                }
                {viewType === 1 ?
                    <>
                        <Button
                            onPress={sendFriendRequest}
                        >
                            Send Friend Request
                        </Button>
                    </>
                    :
                    <></>
                }


            </View>

            <InfoPrompt Message={infoMessage} state={infoPrompt} setEnable={setInfoPrompt}/>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}/>
        </View>
    )
}

export default OtherProfile;