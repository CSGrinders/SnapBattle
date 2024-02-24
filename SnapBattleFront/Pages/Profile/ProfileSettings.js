import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import BackButton from "../../Components/Button/BackButton";
import axios from "axios";
import {useEffect, useState} from "react";
import {deleteUserInfo, getUserInfo} from "../../Storage/Storage";
import ErrorPrompt from "../../Components/ErrorPrompt";
import {Button, Input} from "@rneui/themed";
import InfoPrompt from "../../Components/InfoPrompt";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import SubmitIcon from "../../Components/Group/SubmitSettingsIcon";
import {Image} from "expo-image";
import CloseButton from "../../assets/close.webp";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env

function ProfileSettings({route, navigation}) {

    const {name, username, email, userID} = route.params

    let {width, height} = Dimensions.get('window'); //Get screen size

    //Image avatar
    const [image, setImage] = useState('');

    //Fields
    const [bio, setBio] = useState('');

    //
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmStatus, setConfirmStatus] = useState('');
    const [confirmUsername, setConfirmUsername] = useState('');

    //Server error
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    const [infoMessage, setInfoMessage] = useState('');
    const [infoPrompt, setInfoPrompt] = useState(false);

    function handleSubmit() {
        console.log("submit pressed")
    }

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
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
            }
        });
    }

    function handleDeleteAccount() {
        if (username !== confirmUsername) {
            setConfirmStatus('Username does not match.');
            return
        }
        setConfirmStatus('');
        setConfirmUsername('');
        setConfirmDelete(false);
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/delete`,
        ).then((response) => {
            console.log("test")
            const isDeleted = response.data;
            if (isDeleted) { //Success
                deleteUserInfo(EXPO_PUBLIC_USER_TOKEN).then(() => console.log("User deleted. Deleting user token."));
                deleteUserInfo(EXPO_PUBLIC_USER_INFO).then(() =>  console.log("User deleted. Deleting user data."));
                setInfoPrompt(true);
                setInfoMessage("You are signing out...");
                setTimeout(() => {
                    navigation.navigate('SignIn'); //Success and navigating to main screen after 3 seconds
                }, 2000);
            }
        }).catch((error) => {
            console.log(error)
            if (error.response) { //Error
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
            }
        });
    }



    function handleChangeName() {

    }

    function handleChangeBio() {

    }

    function handleChangePassword() {

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
                    <ProfilePicture size={150}/>
                </TouchableOpacity>
            </View>
            <Text style={{
                marginHorizontal: 30,
                marginTop: 20,
                marginBottom: 10,
                fontSize: 22,
                fontWeight: 'bold',
            }}>
                Name
            </Text>
            <View style={{
                alignItems: 'flex-start',
                flexDirection: "row",
                justifyContent: "flex-start",
                marginLeft: 20,
            }}>
                <Input placeholder='Enter new name' containerStyle={{width: width * 0.8}}></Input>
                <SubmitIcon size={50} submitPressed={handleSubmit}/>
            </View>
            <Text style={{
                marginHorizontal: 30,
                marginTop: 10,
                marginBottom: 10,
                fontSize: 22,
                fontWeight: 'bold',
            }}>
                Biography
            </Text>
            <View style={{
                alignItems: 'flex-start',
                flexDirection: "row",
                justifyContent: "flex-start",
                marginLeft: 20,
            }}>
                <Input placeholder='Enter new bio' containerStyle={{width: width * 0.8}}></Input>
                <SubmitIcon size={50} submitPressed={handleSubmit}/>
            </View>
            <Text style={{
                marginHorizontal: 30,
                marginTop: 10,
                marginBottom: 10,
                fontSize: 22,
                fontWeight: 'bold',
            }}>
                Password
            </Text>
            <View style={{
                alignItems: 'flex-start',
                flexDirection: "row",
                justifyContent: "flex-start",
                marginLeft: 20,
            }}>
                <Input placeholder='Enter your old Password' containerStyle={{width: width * 0.8}}></Input>
                <SubmitIcon size={50} submitPressed={handleSubmit}/>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: width,
                height: height * 0.1
            }}>
                <Button onPress={()=> {
                    setConfirmDelete(true)
                    setConfirmUsername('')
                    setConfirmStatus('')
                }}>Delete Account</Button>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: width,
                height: height * 0.05
            }}>
                <Button onPress={()=> {handleSignOut()}}>Sign Out</Button>
            </View>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
            <InfoPrompt Message={infoMessage} state={infoPrompt} setEnable={setInfoPrompt}></InfoPrompt>
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirmDelete}
                onRequestClose={() => {
                    setConfirmDelete(false)
                    setConfirmStatus('')
                }}>
                <View style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderColor: 'black',
                        borderWidth: 2,
                        borderRadius: 8,
                        padding: 10,
                    }}>
                        <Pressable onPress={() => {
                            setConfirmDelete(false);
                            setConfirmUsername('');
                            setConfirmStatus('');
                        }}>
                            <Image
                                source={CloseButton}
                                style={{
                                    width: 30,
                                    height: 30,
                                    marginLeft: 'auto',
                                }}
                                rcontentFit="cover"
                                transition={500}
                            />
                        </Pressable>
                        <View style={{
                            flex: 0,
                            alignItems: 'center'

                        }}>
                        <View style={{marginBottom: 10}}>
                            <Text>Enter your username: <Text style={{fontFamily: 'OpenSansBold'}}> {username}</Text> to confirm the action.</Text>
                        </View>
                        <Input
                                placeholder='Confirm action'
                                onChangeText={username => {
                                    setConfirmUsername(username)
                                    setConfirmStatus('');
                                }}
                                autoCapitalize="none"
                                errorMessage={confirmStatus}
                            />
                            <View style={{marginTop: 10}}>
                                <Button onPress={() => {handleDeleteAccount()}}>Confirm</Button>

                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    )
}

export default ProfileSettings