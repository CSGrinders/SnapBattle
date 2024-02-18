import {Text, View} from "react-native";
import BackButton from "../../Components/Button/BackButton";
import axios from "axios";
import {useEffect, useState} from "react";
import {deleteUserInfo, getUserInfo} from "../../Storage/Storage";
import ErrorPrompt from "../../Components/ErrorPrompt";
import {Button} from "@rneui/themed";
import InfoPrompt from "../../Components/InfoPrompt";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env

function ProfileSettings({navigation}) {

    //Fields
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [userID, setUserID] = useState('');


    //Server error
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    const [infoMessage, setInfoMessage] = useState('');
    const [infoPrompt, setInfoPrompt] = useState(false);

    useEffect(() => { //Request data from storage
        getUserInfo(EXPO_PUBLIC_USER_INFO).then((info) => {
            if (info) {
                const userData = JSON.parse(info);
                if (userData.name) setName(userData.name);
                if (userData.id) setUserID(userData.id);
            }
        });
    }, []);

    function handleSignOut() {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/signout`,
        ).then((response) => {
            const isSignedOut = response.data;
            if (isSignedOut) { //Success
                deleteUserInfo(EXPO_PUBLIC_USER_TOKEN).then(() => console.log("User logged out. Deleting user token."));
                deleteUserInfo(EXPO_PUBLIC_USER_INFO).then(() =>  console.log("User logged out. Deleting user data."));
                setInfoPrompt(true);
                setInfoMessage("You are signing out...");
                setTimeout(() => {
                    navigation.navigate('SignIn'); //Success and navigating to main screen after 3 seconds
                }, 2000);
            }
        }).catch((error) => {
            if (error.response) { //Error
                console.log("Logging out")
                console.log(error);
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
            }
        });
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Profile Settings Screen</Text>
            <BackButton size={50} navigation={navigation} destination="Main"/>
            <Button onPress={() => {handleSignOut()}}>Sign out</Button>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
            <InfoPrompt Message={infoMessage} state={infoPrompt} setEnable={setInfoPrompt}></InfoPrompt>
        </View>
    )
}

export default ProfileSettings