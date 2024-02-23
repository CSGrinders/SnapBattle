import {KeyboardAvoidingView, Platform, View, Dimensions, SafeAreaView} from "react-native";
import {Image} from 'expo-image';
import Logo from '../../assets/logo.webp'
import {Button, CheckBox, Input, Text} from "@rneui/themed";
import Footer from "../../Components/Footer";
import {useEffect, useState} from "react";
import axios from "axios";
import {deleteUserInfo, getUserInfo, saveUserInfo, setAuthToken} from "../../Storage/Storage";
import LoadingScreen from "../../Components/Auth/LoadingScreen";
import ErrorPrompt from "../../Components/ErrorPrompt";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN, EXPO_PUBLIC_USER_INFO} = process.env


/**
 * There are two displays in this page, the loading page while the data is being loaded
 * or the sign-in page.
 *
 * @return {JSX.Element} - Sign-in screen where users can sign in.
 */

function SignIn({navigation}) {
    let {width, height} = Dimensions.get('window') //Get dimensions of the screen for footer
    const [showPassword, setShowPassword] = useState(false); //Show password checkbox field


    //Input fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    //Input error fields
    const [errorMessageUsername, setErrorMessageUsername] = useState('');
    const [errorMessagePassword, setErrorMessagePassword] = useState('');


    //Server error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);


    //Loading Status
    const [isLoading, setLoading] = useState(false);

    const handleSignIn = () => {

        //Reset input error fields
        setErrorMessageUsername('');
        setErrorMessagePassword('')

        let error = false
        //Check for empty field
        if (!username) {
            setErrorMessageUsername('Field empty.');
            error = true
        }
        if (!password) {
            setErrorMessagePassword('Field empty.');
            error = true
        }
        if (!error) {
            axios.post(
                `${EXPO_PUBLIC_API_URL}/auth`,
                {
                    isLogin: true,
                    token: null,
                    username: username,
                    password: password,
                }
            ).then((response) => {
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
                    setAuthToken(token).then((success) => {console.log("Saved token in the anxios header.")});
                    resetFields()
                    navigation.navigate('Groups'); //Success and navigating to groups screen
                }
            }).catch((error) => {
                const {status, data} = error.response;
                if (error.response) {
                    if (status === 401) {
                        setErrorMessageUsername(data.errorMessage);
                        setErrorMessagePassword(data.errorMessage);
                        return
                    } else if (status === 500) {
                        setErrorMessageServer("Something went wrong...");
                        setErrorServer(true);
                        return
                    }
                } else { //No server connection
                    console.log(error)
                    setErrorMessageServer("Something went wrong...")
                    setErrorServer(true);
                }
                console.log(error)
            });
        }
    }

    function resetFields() {
        setUsername('');
        setPassword('');
        setErrorMessageUsername('');
        setErrorMessagePassword('')
    }


    //Use effect to send a request to the server while the page is loading to see if the token is valid
    useEffect(() => {
        resetFields()
        setLoading(true);
        resetFields()
        getUserInfo(process.env.EXPO_PUBLIC_USER_TOKEN).then((token) => {
            if (token) {
                axios.post(
                    `${EXPO_PUBLIC_API_URL}/auth`,
                    {
                        token: token,
                    }
                ).then(
                    (response) => {
                        //Server response
                        resetFields()
                        const {isAuthenticated} = response.data;
                        if (isAuthenticated) { //No error, but checking if user is authenticated
                            console.log("User verified with token,")
                            setAuthToken(token).then(() => {});
                            setTimeout(() => {
                                navigation.navigate('Groups'); //Success and navigating to groups screen after 3 seconds
                            }, 2000);
                        }
                    })
                    .catch((error) => {
                        resetFields()
                        if (error.response) {
                            const {status} = error.response;
                            //setTimeout(null, 3000
                            setLoading(false);
                            console.log(error)
                            if (status === 500) {
                                setErrorMessageServer("Something went wrong...")
                                setErrorServer(true);
                            }
                            if (status === 400 || status === 401) {
                                deleteUserInfo(EXPO_PUBLIC_USER_INFO).then(() => {
                                });
                                deleteUserInfo(EXPO_PUBLIC_USER_TOKEN).then(() => {
                                });
                            }
                        } else { //No server connection
                            resetFields()
                            console.log(error)
                            setLoading(false);
                            setErrorMessageServer("Something went wrong...")
                            setErrorServer(true);
                        }
                    });
            } else {
                resetFields()
                setLoading(false);
            }
        }).catch((error) => {
            resetFields()
            setLoading(false);
            console.log(error)
        });
    }, []);


    return (
        isLoading ? (
            <LoadingScreen/>
        ) : (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                                  enabled={false}>
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: width,
                    height: height * 0.45,
                }}>
                    <View style={{
                        width: 400,
                        height: 400,
                    }}>
                        <Image
                            style={{width: '100%', height: '100%'}}
                            source={Logo}
                            //placeholder={blurhash}
                            rcontentFit="contain"
                        />
                    </View>
                </View>
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: width,
                    height: height * 0.2,
                }}>
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
                        placeholder='Enter password'
                        secureTextEntry={!showPassword}
                        value={password}
                        autoCapitalize="none"
                        textContentType="password"
                        onChangeText={(text) => {
                            setPassword(text);
                            setErrorMessagePassword('');
                        }}
                        errorMessage={errorMessagePassword}
                    />
                </View>
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
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
                    <Button onPress={() => handleSignIn()}>Sign In</Button>
                    <Text style={{
                        marginHorizontal: 10,
                        marginTop: 10,
                        marginBottom: 10,
                        fontSize: 20,
                    }}>OR</Text>
                    <Button onPress={() => navigation.navigate('SignUp')}>Sign Up</Button>
                </View>
                <View style={{
                    width: width,
                    height: height * 0.08,
                }}><Footer/></View>
                <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
            </KeyboardAvoidingView>
        )
    )
}

export default SignIn