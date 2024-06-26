/**
 * SignUp Component
 *
 * Renders the sign-up screen, allowing new users to create an account.
 * Users are required to input their name, username, email, and password.
 *
 * If the creation of the account is successful, the user data is stored locally, and the user is navigated to the main
 * groups screen.
 *
 * @return {JSX.Element} A sign-up screen allowing users to create a new account.
 */

import {Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, View} from "react-native";
import {Button, CheckBox, Input} from "@rneui/themed";
import Footer from "../../Components/Footer";
import {useState} from "react";
import axios from "axios";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import {deleteUserInfo, saveUserInfo, setAuthToken} from "../../Storage/Storage";
import BackButton from "../../Components/Button/BackButton";
import {setProfileImageCache} from "../../Storage/Cloud";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN, EXPO_PUBLIC_USER_INFO} = process.env;



function SignUp({navigation}) {
    let {width, height} = Dimensions.get('window'); //Get dimensions of the screen for footer
    const [showPassword, setShowPassword] = useState(false); //Show password checkbox field

    //Input fields
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCon, setPasswordCon] = useState('');


    //Input fields text error
    const [errorMessageName, setErrorMessageName] = useState('');
    const [errorMessageUsername, setErrorMessageUsername] = useState('');
    const [errorMessageEmail, setErrorMessageEmail] = useState('');
    const [errorMessagePassword, setErrorMessagePassword] = useState('');
    const [errorMessagePasswordCon, setErrorMessagePasswordCon] = useState('');


    //Server error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);


    //Handle user submit form
    const handleSignUp = () => {

        //Delete user data/token from storage
        deleteUserInfo(EXPO_PUBLIC_USER_INFO).then(null);
        deleteUserInfo(EXPO_PUBLIC_USER_TOKEN).then(null);

        //Reset input error fields
        setErrorMessageName('');
        setErrorMessageUsername('');
        setErrorMessageEmail('');
        setErrorMessagePassword('');
        setErrorMessagePasswordCon('');
        setErrorServer(false);

        //Check for empty fields
        let error = false;
        if (!name) {
            setErrorMessageName('Field empty.');
            error = true;
        }
        if (!username) {
            setErrorMessageUsername('Field empty.');
            error = true;
        }
        if (!email) {
            setErrorMessageEmail('Field empty.');
            error = true;
        }
        if (!password) {
            setErrorMessagePassword('Field empty.');
            error = true;
        }
        if (!passwordCon) {
            setErrorMessagePasswordCon('Field empty.');
            error = true;
        }
        if (password !== passwordCon) {
            setErrorMessagePasswordCon('Passwords do not match.');
            error = true;
        }

        const usernameTest = /^[a-zA-Z0-9_]+$/;
        const nameTest = /^[a-zA-Z]+$/;
        if (name.includes(" ") || !nameTest.test(name)) {
            setErrorMessageName('Invalid syntax. Only letters are allowed.')
            error = true;
        }

        if (username.includes(" ") || !usernameTest.test(username)) {
            if (username !== '') {
                setErrorMessageUsername('Invalid syntax. Only underscores, numbers and letters are allowed.');
                error = true;
            }
        }

        if (password.includes(" ")) {
            setErrorMessagePassword('Invalid password. (No spaces)');
            error = true;
        }

        //Send information the server
        if (!error) {
            axios.post(
                `${EXPO_PUBLIC_API_URL}/auth`,
                {
                    isLogin: false,
                    token: null,
                    name: name,
                    username: username,
                    email: email,
                    password: password,
                }
            ).then((response) => {

                    //Server response
                    const {isAuthenticated, token, profilePicture, userID} = response.data;
                    console.log(response.data)
                    if (isAuthenticated) { //No error, but checking if user is authenticated
                        //Storing userdata and token in system device
                        if (token != null) {
                            saveUserInfo(EXPO_PUBLIC_USER_TOKEN, token).then(() => {
                                console.log("Sign up page: Success saving user token.");
                            })
                                .catch((error) => { //There was an error storing the token
                                        console.log("Sign up page: Error in Token Storage " + error);
                                        setErrorMessageServer("Something went wrong...");
                                        setErrorServer(true);
                                    }
                                );
                        }
                        if (userID != null) {
                            //user contains
                            // Object contains: id (MongDB object id), username, email, name
                            // Note: it will saved in JSON, so make sure to use JSON.parse of you want to obtain the data
                            setProfileImageCache(profilePicture);
                            saveUserInfo(EXPO_PUBLIC_USER_INFO, userID).then(() => {
                                console.log("Sign up page: Success saving user data.");
                            })
                                .catch((error) => {//There was an error storing the user
                                        console.log("Sign up page: Error in User Storage " + error);
                                        setErrorMessageServer("Something went wrong...");
                                        setErrorServer(true);
                                    }
                                );
                        }
                        setAuthToken(token).then(null);
                        navigation.navigate('Main', {userID: userID}); //Success and navigating to main screen
                    }
                }
            ).catch((error) => { //There was an error in fields or server connection
                if (error && error.response) {
                    const {status, data} = error.response;
                    if (status === 400 || status === 409) { //Wrong syntax or No access
                        if (data.errorMessage.toLowerCase().includes("password")) {
                            setErrorMessagePassword(data.errorMessage);
                        } else if (data.errorMessage.toLowerCase().includes("email") && data.errorMessage !== "Invalid email.") {
                            setErrorMessageEmail(data.errorMessage);
                        } else if (data.errorMessage.toLowerCase().includes("name")
                            && !data.errorMessage.includes("(2-8 Chars)")
                            && data.errorMessage !== "Username already exists.") {
                            setErrorMessageName(data.errorMessage);
                        } else if (data.errorMessage.toLowerCase().includes("username")) {
                            setErrorMessageUsername(data.errorMessage);
                        } else if (data.errorMessage.toLowerCase().includes("email")) {
                            setErrorMessageEmail(data.errorMessage);
                        }
                    } else if (status === 500) { //Server error
                        console.log("Sign up page: " + error);
                        setErrorMessageServer(data.errorMessage);
                        setErrorServer(true);
                    } else {
                        console.log("Sign up page: " + error);
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                    }
                } else { //No server connection
                    console.log("Sign up page: " + error);
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                }
            })
        }
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
                <View style={{
                    paddingLeft: 20,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingRight: 20
                }}>
                    <Text style={{
                        fontSize: 40,
                        fontFamily: 'OpenSansBold'
                    }}>Sign up</Text>
                    <Text style={{fontSize: 24}}>Create your account</Text>
                </View>
            </View>
            <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: width,
                height: height * 0.5
            }}>
                <Input
                    placeholder='Enter name'
                    value={name}
                    autoCapitalize="none"
                    onChangeText={(text) => {
                        setName(text);
                        setErrorMessageName('');
                    }}
                    errorMessage={errorMessageName}
                />
                <Input
                    placeholder='Enter username'
                    value={username}
                    autoCapitalize="none"
                    onChangeText={(text) => {
                        setUsername(text);
                        setErrorMessageUsername('');
                    }}
                    errorMessage={errorMessageUsername}
                />
                <Input
                    placeholder='Enter email'
                    value={email}
                    autoCapitalize="none"
                    onChangeText={(text) => {
                        setEmail(text);
                        setErrorMessageEmail('');
                    }}
                    errorMessage={errorMessageEmail}
                />
                <Input
                    placeholder='Enter password'
                    secureTextEntry={!showPassword}
                    value={password}
                    textContentType="password"
                    autoCompleteType="password"
                    onChangeText={(text) => {
                        setPassword(text);
                        setErrorMessagePassword('');
                    }}
                    errorMessage={errorMessagePassword}
                />
                <Input
                    placeholder='Confirm password'
                    secureTextEntry={!showPassword}
                    value={passwordCon}
                    textContentType="password"
                    autoCompleteType="password"
                    autoCapitalize="none"
                    onChangeText={(text) => {
                        setPasswordCon(text);
                        setErrorMessagePasswordCon('');
                    }}
                    errorMessage={errorMessagePasswordCon}
                />
            </View>
            <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: width,
                height: Platform.OS === "ios" ? height * 0.2 : height * 0.25,
            }}>
                <View style={{marginBottom: 10, width: '45%'}}>
                    <CheckBox
                        title="Show Password"
                        style={{
                            fontFamily: 'OpenSansRegular',
                        }}
                        checked={showPassword}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                </View>
                <Button onPress={handleSignUp}>Sign Up</Button>
            </View>
            <View
                style={{width: width, height: Platform.OS === "ios" ? height * 0.055 : height * 0.045}}><Footer/>
            </View>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
        </KeyboardAvoidingView>
    )
}

export default SignUp;