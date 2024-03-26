/**
 * Profile Component
 *
 * This component displays the user's profile page, showing the name, username, biography, and achievements.
 * It also allows users to navigate to the profile settings page for any modifications
 * and to the friends page to view or manage their friends.
 *
 *
 * @component
 * @return {JSX.Element} User's profile.
 */


import {Dimensions, TouchableOpacity, View, Text} from "react-native";
import {Button} from "@rneui/themed";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import BackButton from "../../Components/Button/BackButton";
import SettingIcon from '../../assets/profile-setting-icon.webp';
import {Image} from 'expo-image';
import {useCallback, useState} from "react";
import axios from "axios";
import {useFocusEffect} from "@react-navigation/native";

const {EXPO_PUBLIC_API_URL} = process.env;

function Profile({route, navigation}) {
    const {width, height} = Dimensions.get('window'); //Get dimensions of the screen for footer

    const {userID} = route.params; // actually route/params does not pass username and name from group page
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('');
    const [achievements, setAchievements] = useState('');

    //Server error
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    const [pfpSeed, setPfpSeed] = useState(1);


    useFocusEffect(
        useCallback(() => {
            getUserInfo();
        }, [])
    );

    function getUserInfo() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/getProfileInfo`
        )
            .then((res) => {
                const {name, username, profilePicture, achievements, bio} = res.data
                setName(name)
                setUsername(username)
                if (achievements === 0) {
                    setAchievements("No Achievements Yet!");
                } else {
                    setAchievements(achievements);
                }
                setBio(bio);
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                } else {
                    console.log("Profile page: " + error);
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
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{
                        fontSize: 40,
                        fontFamily: 'OpenSansBold'
                    }}>Profile Page</Text>
                </View>
                <View style={{marginRight: 20}}>
                    <TouchableOpacity
                        onPress={
                        () => navigation.navigate('ProfileSettings', {userID: userID, name: name, username: username})}
                    >
                        <Image
                            source={SettingIcon}
                            style={{
                                width: 45,
                                height: 45
                        }}></Image>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: height * 0.15,
            }}>
                <ProfilePicture size={150} temp_image={''} userID={userID} currentUserID={userID}/>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 24,
                }}>{name}</Text>
                <Text>@{username}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                height: height * 0.25,
                width: width * 0.9,
                marginLeft: 15
            }}>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                }}>
                    Biography
                </Text>
                <Text style={{marginTop: 3}}>{bio}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.9,
                marginLeft: 15
            }}>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                }}>
                    Achievements
                </Text>
                <Text>{achievements}</Text>
            </View>

            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: width,
                height: height * 0.5
            }}>
                <Button onPress={() => navigation.navigate("Friends", {userID: userID})}>
                    Friends
                </Button>
            </View>
        </View>
    )
}

export default Profile;