import {Dimensions, Text, SafeAreaView, View} from "react-native";
import {Button} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import {useState} from "react";
import axios from "axios";
import ErrorPrompt from "../../Components/ErrorPrompt";
import InfoPrompt from "../../Components/InfoPrompt";
import OtherProfilePicture from "../../Components/Profile/OtherProfilePicture";
const {EXPO_PUBLIC_API_URL} = process.env

function OtherProfile({route, navigation}) {
    const {width, height} = Dimensions.get('window') //Get dimensions of the screen for footer

    const {name, username, email, userID, searchName, searchUsername, searchEmail, searchBio, searchID} = route.params

    const [image, setImage] = useState('')

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
        }).catch((err) => {
            setErrorMessageServer(err.response.data.errorMessage);
            setErrorServer(true);
        })
    }

    return (
        <SafeAreaView style={{
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: width,
            height: height}}
        >
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: width * 0.9,
                height: height * 0.15,
            }}>
                <BackButton size={50} navigation={navigation} destination={"Friends"} params={{name: name, username: username, email: email, userID: userID}}/>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: height * 0.2,
            }}>
                <OtherProfilePicture size={150} searchID={searchID}/>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>{searchName}</Text>
                <Text>@{searchUsername}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                height: height * 0.1
            }}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 25,
                }}>Bio</Text>
                <Text>{searchBio}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                height: height * 0.1
            }}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 25,
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
        </SafeAreaView>
    )
}

export default OtherProfile