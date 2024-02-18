import {Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, View} from "react-native";
import {Button, CheckBox, Input} from "@rneui/themed";
import Footer from "../../Components/Footer";
import {useState} from "react";
import BackIcon from '../../assets/back-icon.webp'
import {Image} from 'expo-image';
import axios from "axios";
import ErrorPrompt from "../../Components/ErrorPrompt";
import {deleteUserInfo, saveUserInfo, setAuthToken} from "../../Storage/Storage";
import BackButton from "../../Components/Button/BackButton";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN, EXPO_PUBLIC_USER_INFO} = process.env


/**
 * @return {JSX.Element} - Sign-up screen where users can create a new account.
 */


function SignUp({navigation}) {
    let {width, height} = Dimensions.get('window') //Get dimensions of the screen for footer
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
        deleteUserInfo(EXPO_PUBLIC_USER_INFO).then(() => {});
        deleteUserInfo(EXPO_PUBLIC_USER_TOKEN).then(() => {});

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
                    const {isAuthenticated, token, user} = response.data;
                    if (isAuthenticated) { //No error, but checking if user is authenticated
                        //Storing userdata and token in system device
                        if (token != null) {
                            saveUserInfo(EXPO_PUBLIC_USER_TOKEN, token).then(() => {
                                console.log("Success saving user token")
                            })
                                .catch((error) => { //There was an error storing the token
                                        console.log("Error in Token Storage");
                                        console.log(error);
                                        setErrorMessageServer("Something went wrong...");
                                        setErrorServer(true);
                                    }
                                );
                        }
                        if (user != null) {
                            //user contains
                            // Object contains: id (MongDB object id), username, email, name
                            // Note: it will saved in JSON, so make sure to use JSON.parse of you want to obtain the data
                            saveUserInfo(EXPO_PUBLIC_USER_INFO, JSON.stringify(user)).then(() => {
                                console.log("Success saving user data")
                            })
                                .catch((error) => {//There was an error storing the user
                                        console.log("Error in User Storage");
                                        console.log(error);
                                        setErrorMessageServer("Something went wrong...");
                                        setErrorServer(true);
                                    }
                                );
                        }
                        setAuthToken(token).then(() => {});
                        navigation.navigate('Main'); //Success and navigating to main screen
                    }
                }
            ).catch((error) => { //There was an error in fields or server connection
                if (error.response) {
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
                        setErrorMessageServer(data.errorMessage);
                        setErrorServer(true);
                    } else {
                        setErrorMessageServer("Something went wrong...")
                        setErrorServer(true);
                    }
                } else { //No server connection
                    console.log(error)
                    setErrorMessageServer("Something went wrong...")
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
                <View style={{paddingLeft: 20, alignItems: 'flex-start'}}>
                    <BackButton size={50} navigation={navigation} destination="SignIn"/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 20}}>
                    <Text style={{fontSize: 36, fontFamily: 'OpenSansBold'}}>Sign up</Text>
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

export default SignUp