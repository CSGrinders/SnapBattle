import {Dimensions, Pressable, SafeAreaView, TouchableOpacity, View} from "react-native";
import {Button, Text} from "@rneui/themed";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import BackButton from "../../Components/Button/BackButton";
import SettingIcon from '../../assets/profile-setting-icon.webp'
import {Image} from 'expo-image';
import {useEffect, useState} from "react";
import axios from "axios";
import ErrorPrompt from "../../Components/ErrorPrompt";
import InfoPrompt from "../../Components/InfoPrompt";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO} = process.env

function OtherProfile({route, navigation}) {
    const {width, height} = Dimensions.get('window') //Get dimensions of the screen for footer

    const {name, username, email, userID, searchName, searchUsername, searchEmail, searchBio} = route.params

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
            justifyContent: 'center',
            width: width,
            height: height}}
        >
            <View style={{
                alignItems: 'center',
                flex: 2
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: width * 0.9,
                }}>
                    <BackButton size={50} navigation={navigation} destination={"Friends"} params={{name: name, username: username, email: email, userID: userID}}/>
                </View>
                <ProfilePicture size={150}/>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>{searchName}</Text>
                <Text>@{searchUsername}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                flex: 1
            }}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    marginBottom: 5
                }}>Bio</Text>
                <Text>{searchBio}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                flex: 1
            }}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    marginBottom: 5
                }}>Achievements</Text>
                <Text>Winner x2</Text>
            </View>


            <View style={{justifyContent: 'flex-end', flex: 2}}>
                <Button
                    style={{
                        alignContent: 'flex-end',
                        alignItems: 'center',
                        justifyContent: 'center'}}
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