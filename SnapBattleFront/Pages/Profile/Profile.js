import {Dimensions, Pressable, SafeAreaView, TouchableOpacity, View} from "react-native";
import {Button, Text} from "@rneui/themed";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import BackButton from "../../Components/Button/BackButton";
import SettingIcon from '../../assets/profile-setting-icon.webp'
import BackIcon from '../../assets/back-icon.webp'
import {Image} from 'expo-image';
import {useState} from "react";
import * as ImagePicker from 'react-native-image-picker';
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
function Profile({navigation}) {
    let {width, height} = Dimensions.get('window') //Get dimensions of the screen for footer


    const [image, setImage] = useState('');
    const settingPressed = () => {
        navigation.navigate('ProfileSettings', {navigation: navigation})
    }

    const pfPressed = () => {
        imagePicker();
    }

    const imagePicker = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('Image picker error: ', response.error);
            } else {
                let imageUri = response.uri || response.assets?.[0]?.uri;
                setImage(imageUri);
            }
        });
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
                    <BackButton size={50}/>
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
                    justifyContent: 'center'}}>
                    Friends
                </Button>
            </View>
        </SafeAreaView>
    )
}

export default Profile