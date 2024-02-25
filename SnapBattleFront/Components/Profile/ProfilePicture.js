import {View, Text} from "react-native";
import {Image} from 'expo-image';
import default_image_source from '../../assets/default-profile-picture.webp'
import {getUserInfo} from "../../Storage/Storage";
import {useCallback, useEffect, useState} from "react";
import {getProfilePhoto} from "../../Storage/Cloud";
import {useFocusEffect} from "@react-navigation/native";
const {EXPO_PUBLIC_USER_INFO} = process.env


/**
 * @returns {JSX.Element} - User profile picture
 */

const ProfilePicture = ({size, temp_image}) => {

    const [userID, setUserID] = useState('');
    const [image, setImage] = useState('');



    useFocusEffect(
        useCallback(() => {
            getUserInfo(EXPO_PUBLIC_USER_INFO).then((info) => {
                if (info) {
                    const userData = JSON.parse(info);
                    if (userData.id) setUserID(userData.id);
                    getProfilePhoto(userData.id)
                        .then((data) => {
                            try {
                                setImage(data.url);
                            } catch {
                                setImage('');
                            }
                        });
                }
            })
        }, [])
    )

    useEffect(() => {
        getUserInfo(EXPO_PUBLIC_USER_INFO).then((info) => {
            if (info) {
                const userData = JSON.parse(info);
                if (userData.id) setUserID(userData.id);
                getProfilePhoto(userData.id)
                    .then((data) => {
                        try {
                            setImage(data.url);
                        } catch {
                            setImage('');
                        }
                    });
            }
        });
    }, [image]);

    return (
        <View>
            {temp_image !== '' && temp_image !== undefined ? (<Image source={{uri: temp_image}}
                                         style={{
                                             width: size,
                                             height: size,
                                             borderRadius: size / 2,
                                             borderWidth: size / 35
                                         }}
            />) : (<View>
                {image !== '' ? (<Image source={{uri: image}}
                                        style={{
                                            width: size,
                                            height: size,
                                            borderRadius: size / 2,
                                            borderWidth: size / 35
                                        }}
                />) : (<Image source={default_image_source}
                              style={{
                                  width: size,
                                  height: size,
                                  borderRadius: size / 2
                              }}
                />)}
            </View>)}
        </View>
    )
}

export default ProfilePicture;