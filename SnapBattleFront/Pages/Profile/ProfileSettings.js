import {Dimensions, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View} from "react-native";
import BackButton from "../../Components/Button/BackButton";
import axios from "axios";
import {useEffect, useState} from "react";
import {deleteUserInfo, getUserInfo} from "../../Storage/Storage";
import ErrorPrompt from "../../Components/ErrorPrompt";
import {Button, Input} from "@rneui/themed";
import InfoPrompt from "../../Components/InfoPrompt";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env

function ProfileSettings({route, navigation}) {

    const {name, username, email, userID} = route.params

    let {width, height} = Dimensions.get('window'); //Get screen size

    //Image avatar
    const [image, setImage] = useState('');

    //Fields
    const [bio, setBio] = useState('');


    //Server error
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    const [infoMessage, setInfoMessage] = useState('');
    const [infoPrompt, setInfoPrompt] = useState(false);

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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                              enabled={false}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: height * 0.2,
                width: width * 0.9,
            }}>
                <View style={{paddingLeft: 15, alignItems: 'flex-start'}}>
                    <BackButton
                        size={50}
                        navigation={navigation}
                        destination={"Profile"}
                        params={route.params}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 36, fontFamily: 'OpenSansBold'}}>Profile Settings</Text>
                </View>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: height * 0.1,
            }}>
                <TouchableOpacity onPress={() => {}}>
                    <ProfilePicture size={150} source={image}/>
                </TouchableOpacity>
            </View>
            <View>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 20,
                    marginBottom: 10,
                    fontSize: 25,
                    fontWeight: 'bold',
                }}>
                    New Name
                </Text>
                <View style={{
                    alignItems: 'center',
                }}>
                    <Input placeholder='Enter your name'/>
                </View>
            </View>
            <View>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 20,
                    marginBottom: 10,
                    fontSize: 25,
                    fontWeight: 'bold',
                }}>
                    Biography
                </Text>
                <View style={{
                    alignItems: 'center',
                }}>
                    <Input placeholder='Enter your new bio'/>
                </View>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: width,
                height: height * 0.5
            }}>
                <Button onPress={() => {handleSignOut()}}>Sign out</Button>
            </View>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
            <InfoPrompt Message={infoMessage} state={infoPrompt} setEnable={setInfoPrompt}></InfoPrompt>
        </KeyboardAvoidingView>
    )
}

export default ProfileSettings