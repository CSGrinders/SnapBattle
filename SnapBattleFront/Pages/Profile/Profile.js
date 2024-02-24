import {Dimensions, Pressable, SafeAreaView, TouchableOpacity, View, Text} from "react-native";
import {Button} from "@rneui/themed";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import BackButton from "../../Components/Button/BackButton";
import SettingIcon from '../../assets/profile-setting-icon.webp'
import {Image} from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {useCallback, useEffect, useState} from "react";
import {getProfilePhoto, saveImageToCloud} from "../../Storage/Cloud";
import {getUserInfo} from "../../Storage/Storage";
import axios from "axios";
import {useFocusEffect} from "@react-navigation/native";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO} = process.env

function Profile({route, navigation}) {
    const {width, height} = Dimensions.get('window') //Get dimensions of the screen for footer

    const {name, username, email, userID} = route.params
    const [bio, setBio] = useState('');
    const [achievements, setAchievements] = useState('');

    const [image, setImage] = useState('');


    const pfPressed = () => {
        imagePicker();
    }

    useFocusEffect(
        useCallback(() => {
            getUserInfo()
        }, [userID])
    )

    function getUserInfo() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/getProfileInfo`
        )
            .then((res) => {
                setAchievements(res.data.achievements)
                setBio(res.data.bio)
            })
            .catch((err) => {
                console.log("bruh profee")
            })
        getProfilePhoto(userID)
            .then((data) => {
                setImage(data.url)
            });
    }
    const imagePicker = async () => {
        try {
            let selectedImage = null;
            selectedImage = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 4],
                quality: 1,
            });
            console.log(selectedImage.assets[0].uri);
            await saveImageToCloud(userID, selectedImage.assets[0].uri);
            await setImage(selectedImage.assets[0].uri);
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <SafeAreaView style={{
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: width,
            height: height
        }}
        >
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: width * 0.9,
                height: height * 0.15,
            }}>
                <BackButton size={50} navigation={navigation} destination={"Groups"}/>
                <Text style={{fontSize: 36, fontFamily: 'OpenSansBold'}}>Profile Page</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ProfileSettings', route.params)}>
                    <Image source={SettingIcon} style={{width:50, height:50}}></Image>
                </TouchableOpacity>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: height * 0.25,
            }}>
                <TouchableOpacity onPress={pfPressed}>
                    <ProfilePicture size={150}/>
                </TouchableOpacity>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>{name}</Text>
                <Text>@{username}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                height: height * 0.1
            }}>
                <Text style={{
                    fontSize: 25,
                    fontWeight: 'bold',
                }}>
                    Bio
                </Text>
                <Text>{bio}</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                height: height * 0.1
            }}>
                <Text style={{
                    fontSize: 25,
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
                <Button onPress={() => navigation.navigate("Friends", route.params)}>
                    Friends
                </Button>
            </View>
        </SafeAreaView>
    )
}

export default Profile