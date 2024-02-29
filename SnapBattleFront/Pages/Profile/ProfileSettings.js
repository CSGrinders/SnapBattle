/**
 * Profile Settings Component
 *
 * This component renders the settings page for a user's profile. It
 * allows users to update their personal information, and also allows to
 * delete or sign out from the account.
 *
 * @component
 * @return {JSX.Element} User's profile settings.
 */

import {
    ActivityIndicator,
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
import {useCallback, useState} from "react";
import {deleteUserInfo, getUserInfo, saveUserInfo, setAuthToken} from "../../Storage/Storage";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import {Button, Input} from "@rneui/themed";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import SubmitIcon from "../../Components/Group/SubmitSettingsIcon";
import {Image} from "expo-image";
import CloseButton from "../../assets/close.webp";
import * as ImagePicker from "expo-image-picker";
import {getProfilePhoto, saveImageToCloud, setProfileImageCache} from "../../Storage/Cloud";
import {useFocusEffect} from "@react-navigation/native";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env;

function ProfileSettings({route, navigation}) {

    const {name, username, userID} = route.params;

    let {width, height} = Dimensions.get('window'); //Get screen size

    //Image avatar
    const [image, setImage] = useState('');

    //Fields
    const [newBio, setNewBio] = useState('');
    const [newName, setNewName] = useState(name);
    const [newPassword, setNewPassword] = useState('');
    const [option, setOption] = useState('');

    const [errorMessageName, setErrorMessageName] = useState('');
    const [errorMessageBio, setErrorMessageBio] = useState('');
    const [errorMessagePassword, setErrorMessagePassword] = useState('');

    //Prompt delete/password
    const [confirm, setConfirm] = useState(false);
    const [confirmStatus, setConfirmStatus] = useState('');
    const [confirmUsername, setConfirmUsername] = useState('');

    //Server error
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    const [infoMessage, setInfoMessage] = useState('');
    const [infoPrompt, setInfoPrompt] = useState(false);

    const [loading, setLoading] = useState(false);


    const pfPressed = () => {
        imagePicker();
    }

    useFocusEffect(
        useCallback(() => {
            setImage('');
        }, [userID])
    );

    async function imagePicker() {
        try {
            let selectedImage = null;
            selectedImage = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 4],
                quality: 0,
                base64: true
            });
            if (selectedImage.assets) {
                // turn on reload pop up and deactivate interactions
                setLoading(true);
                await saveImageToCloud(userID, selectedImage.assets[0].base64);
                // turn off reload
                setLoading(false);
                setInfoPrompt(true);
                setInfoMessage("Image Uploaded");
                setImage(selectedImage.assets[0].uri);
                setProfileImageCache(selectedImage.assets[0].uri);
            }
        } catch (error) {
            console.log("Profile settings page: " + error);
        }
    }
    // Handle sign out
    function handleSignOut() {
        setProfileImageCache('default');
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/signout`,
        ).then((response) => {
            const isSignedOut = response.data;
            if (isSignedOut) { //Success
                deleteUserInfo(EXPO_PUBLIC_USER_TOKEN).then(() => console.log("Profile settings page: User logged out. Deleting user token."));
                deleteUserInfo(EXPO_PUBLIC_USER_INFO).then(() =>  console.log("Profile settings page: User logged out. Deleting user data."));
                setAuthToken(null).then(null);
                setInfoPrompt(true);
                setInfoMessage("You are signing out...");
                setTimeout(() => {
                    navigation.navigate('SignIn'); //Success and navigating to main screen after 3 seconds
                }, 2000);
            }
        }).catch((error) => {
            const {status, data} = error.response;
            if (error.response) { //Error
                if (status !== 500) {
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                } else {
                    console.log("Profile settings page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            } else {
                console.log("Profile settings page: " + error);
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
            }
        });
    }

    function handleDeleteAccount() {
        console.log(username, confirmUsername);
        if (username !== confirmUsername) { //Different usernames
            setConfirmStatus('Username does not match.');
            return;
        }
        //Reset fields
        setConfirmStatus('');
        setConfirmUsername('');
        setConfirm(false);

        //Request to the server
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/delete`,
        ).then((response) => {
            const isDeleted = response.data;
            if (isDeleted) { //Success
                deleteUserInfo(EXPO_PUBLIC_USER_TOKEN).then(() => console.log("Profile settings page: User deleted. Deleting user token."));
                deleteUserInfo(EXPO_PUBLIC_USER_INFO).then(() =>  console.log("Profile settings page: User deleted. Deleting user data."));
                setAuthToken(null).then(null);
                setInfoPrompt(true);
                setInfoMessage("You are signing out...");
                setTimeout(() => {
                    navigation.navigate('SignIn'); //Success and navigating to main screen after 3 seconds
                }, 2000);
            }
        }).catch((error) => {
            const {status, data} = error.response;
            if (error.response) { //Error
                if (status !== 500) {
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                } else {
                    console.log("Profile settings page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            } else {
                console.log("Profile settings page: " + error);
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
            }
        });
    }


    //Handle Change name
    function handleChangeName() {
        if (newName === '') { //Empty fields
            setErrorMessageName('Empty field.');
        } else if (name === newName) {
            setErrorMessageName('The new name should be different.');
        } else {
            axios.post(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/changename`,
                {
                    newName: newName,
                }
            ).then((response) => {
                const nameChanged = response.data;
                if (nameChanged) { //Success
                    //route.params.name = newName;
                    setInfoPrompt(true);
                    setInfoMessage("You changed your name!");
                    setErrorMessageName('');
                }
            }).catch((error) => {
                setNewName(name);
                const {status, data} = error.response;
                if (error.response) { //Error
                    if (status !== 500) {
                        setErrorMessageName(data.errorMessage);
                    } else {
                        console.log("Profile settings page: " + error);
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                    }
                } else {
                    console.log("Profile settings page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            });
        }
    }

    // Change Bio
    function handleChangeBio() {
        if (newBio === '') { //Empty fields
            setErrorMessageBio('Empty field.');
        } else {
            axios.post(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/changebio`,
                {
                    newBio: newBio,
                }
            ).then((response) => {
                const bioChanged = response.data;
                if (bioChanged) { //Success
                    //route.params.name = newName;
                    setInfoPrompt(true);
                    setInfoMessage("You changed your biography!");
                    setErrorMessageName('');
                }
            }).catch((error) => {
                const {status, data} = error.response;
                if (error.response) { //Error
                    if (status !== 500) {
                        setErrorMessageBio(data.errorMessage);
                    } else {
                        console.log("Profile settings page: " + error);
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                    }
                } else {
                    console.log("Profile settings page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            });
        }
    }

    function handleChangePassword() {
        setConfirm(false);
        setConfirmStatus('');
        setOption('');
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/changepassword`,
            {
                newPassword: newPassword,
            }
        ).then((response) => {
            const passChanged = response.data;
            if (passChanged) { //Success
                setInfoPrompt(true);
                setInfoMessage("You changed your password!");
                setErrorMessageName('');
            }
        }).catch((error) => {
            console.log("Profile settings page: " + error);
            const {status, data} = error.response;
            if (error.response) { //Error
                if (status !== 500) {
                    setErrorMessagePassword(data.errorMessage);
                } else {
                    console.log("Profile settings page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            } else {
                console.log("Profile settings page: " + error);
                setErrorMessageServer("Something went wrong...");
                setErrorServer(true);
            }
        });
    }

    //Handle option for user confirm modal
    function modeOption() {
        if (option === "delete") {
            handleDeleteAccount();
        } else {
            handleChangePassword();
        }
    }

    function handleOption() {
        if (newPassword === '') { //Empty field
            setErrorMessagePassword("Empty field.");
            return;
        }
        if (newPassword.includes(" ")) { //Check for invalid input
            setErrorMessagePassword('Invalid password. (No spaces)');
            return;
        }
        setOption("password");
        setConfirm(true);
    }


    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                              enabled={false}>
            {loading && (
                <View>
                    <ActivityIndicator size="large" color="blue" style={{
                        position: 'absolute',
                        left: (width / 2) - 10,
                        top: height / 2,
                    }} />
                </View>
            )}


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
                    {!loading && <BackButton
                        size={50}
                        navigation={navigation}
                    />}
                </View>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{
                        fontSize: 40,
                        fontFamily: 'OpenSansBold'
                    }}>Profile Settings</Text>
                </View>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: height * 0.1,
            }}>
                <TouchableOpacity onPress={pfPressed} disabled={loading}>
                    <ProfilePicture size={150} temp_image={image}/>
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
                <Input
                    placeholder='Enter new name'
                    disabled={loading}
                    containerStyle={{width: width * 0.8}}
                    onChangeText={newName => {
                        setNewName(newName);
                        setErrorMessageName('');
                    }}
                    autoCapitalize="none"
                    errorMessage={errorMessageName}
                ></Input>
                {!loading ? <SubmitIcon size={50} submitPressed={handleChangeName}/> : <SubmitIcon size={50}/> }
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
                <Input
                    placeholder='Enter new bio'
                    disabled={loading}
                    containerStyle={{width: width * 0.8}}
                    onChangeText={newBio => {
                        setNewBio(newBio);
                        setErrorMessageBio('');
                    }}
                    autoCapitalize="none"
                    errorMessage={errorMessageBio}
                ></Input>
                {!loading ? <SubmitIcon size={50} submitPressed={handleChangeBio}/> : <SubmitIcon size={50}/> }
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
            }}
                  disabled={loading}>
                <Input
                    placeholder='Enter your new Password'
                    containerStyle={{width: width * 0.8}}
                    disabled={loading}
                    onChangeText={newPassword => {
                        setNewPassword(newPassword);
                        setErrorMessagePassword('');
                    }}
                    autoCapitalize="none"
                    errorMessage={errorMessagePassword}
                ></Input>
                {!loading ? <SubmitIcon size={50} submitPressed={handleOption}/> : <SubmitIcon size={50}/> }
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: width,
                height: height * 0.1
            }}>
                <Button onPress={()=> {
                    setOption("delete");
                    setConfirm(true);
                    setConfirmUsername('');
                    setConfirmStatus('');
                }} disabled={loading} >Delete Account</Button>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: width,
                height: height * 0.05
            }}>
                <Button disabled={loading} onPress={()=> {handleSignOut()}}>Sign Out</Button>
            </View>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
            <InfoPrompt Message={infoMessage} state={infoPrompt} setEnable={setInfoPrompt}></InfoPrompt>
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirm}
                onRequestClose={() => {
                    setConfirm(false);
                    setConfirmStatus('');
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
                            setConfirm(false);
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
                                placeholder='Confirm action.'
                                onChangeText={username => {
                                    setConfirmUsername(username);
                                    setConfirmStatus('');
                                }}
                                autoCapitalize="none"
                                errorMessage={confirmStatus}
                            />
                            <View style={{marginTop: 10}}>
                                <Button onPress={() => {modeOption()}}>Confirm</Button>

                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    )
}

export default ProfileSettings;