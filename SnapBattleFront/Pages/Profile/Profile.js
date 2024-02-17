import {Dimensions, Pressable, SafeAreaView, TouchableOpacity, View} from "react-native";
import {Button, Text} from "@rneui/themed";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import BackButton from "../../Components/Button/BackButton";
import SettingIcon from '../../assets/profile-setting-icon.webp'
import {Image} from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {useState} from "react";
import {saveImageToCloud} from "../../Storage/Cloud";
function Profile({navigation}) {
    let {width, height} = Dimensions.get('window') //Get dimensions of the screen for footer


    const [image, setImage] = useState('');
    const settingPressed = () => {
        // navigation.navigate('ProfileSettings', {navigation: navigation})
        alert("setting")
    }

    const pfPressed = () => {
        imagePicker();
    }

    const backPressed = () => {
        console.log("navigate to previous screen");
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
            console.log(selectedImage.assets[0].uri)
            await saveImageToCloud(selectedImage.assets[0].uri);
            await setImage(selectedImage.assets[0].uri);
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <SafeAreaView style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: width,
            height: height}}>
            <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: height * 0.3
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: width * 0.9,
                    height: 5
                }}>
                    <BackButton size={50} backPressed={backPressed}/>
                    <TouchableOpacity onPress={settingPressed}>
                        <Image source={SettingIcon} style={{width:50, height:50}}></Image>
                    </TouchableOpacity>
                </View>
                <Pressable onPress={pfPressed}>
                    <ProfilePicture size={150} source={image}/>
                </Pressable>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Name</Text>
                <Text>@username</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                height: height * 0.1}}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    marginBottom: 5
                }}>Bio</Text>
                <Text>Hello World!</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                height: height * 0.1}}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    marginBottom: 5
                }}>Achievements</Text>
                <Text>Winner x2</Text>
            </View>

            <View style={{height: height * 0.35, justifyContent: 'flex-end'}}>
                <Button style={{
                    alignContent: 'flex-end',
                    alignItems: 'center',
                    justifyContent: 'center'}}
                >
                    Friends
                </Button>
            </View>
        </SafeAreaView>
    )
}

export default Profile