/**
 * OtherProfile Component
 *
 * This component displays the profile details of other users.
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

    const {name, username, email, userID, searchName, searchUsername, searchEmail, searchBio, searchID} = route.params;

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
                    <BackButton size={50} navigation={navigation}
                                destination={"Friends"}
                                params={{name: name, username: username, email: email, userID: userID
                    }}/>
                </View>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: height * 0.15,
            }}>
                <OtherProfilePicture size={150} searchID={searchID}/>
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
                height: height * 0.5
            }}>
                <Button
                    onPress={sendFriendRequest}
                >
                    Send Friend Request
                </Button>
            </View>

            <InfoPrompt Message={infoMessage} state={infoPrompt} setEnable={setInfoPrompt}/>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}/>
        </View>
    )
}

export default OtherProfile;