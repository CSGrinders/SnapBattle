import {View} from "react-native";
import {Image} from 'expo-image';
import default_image_source from '../../assets/default-profile-picture.webp'
import {getUserInfo} from "../../Storage/Storage";
import {useCallback, useState} from "react";
import {getProfilePhoto} from "../../Storage/Cloud";
import {useFocusEffect} from "@react-navigation/native";
const {EXPO_PUBLIC_USER_INFO} = process.env

const OtherProfilePicture = ({size, searchID}) => {
    const [userID, setUserID] = useState('');
    const [image, setImage] = useState('');

    useFocusEffect(
        useCallback(() => {
            getProfilePhoto(searchID)
                .then((data) => {
                    try {
                        setImage(data.url)
                    } catch {
                        setImage('')
                    }
                });
        }, [])
    )



    return (
        <View>
            {image!=='' ? (<Image source={{uri: image}}
                                  style={{
                                      width: size,
                                      height: size,
                                      borderRadius: size/2,
                                      borderWidth: size/35
                                  }}
            />) : (<Image source={default_image_source}
                          style={{
                              width: size,
                              height: size,
                              borderRadius: size/2
                          }}
            />)}
        </View>
    )
}

export default OtherProfilePicture