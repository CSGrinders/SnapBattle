import {View, Text} from "react-native";
import {Image} from 'expo-image';
import default_image_source from '../../assets/default-profile-picture.webp'
import {getUserInfo} from "../../Storage/Storage";
import {useCallback, useEffect, useState} from "react";
import {getProfileImageCache, getProfilePhoto, setProfileImageCache} from "../../Storage/Cloud";
import {useFocusEffect} from "@react-navigation/native";
const {EXPO_PUBLIC_USER_INFO} = process.env


/**
 * @returns {JSX.Element} - User profile picture
 */

const ProfilePicture = ({size, temp_image}) => {


    const blurhash =
        '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';
    const [userID, setUserID] = useState('');
    const [image, setImage] = useState('');

    useFocusEffect(
        useCallback(() => {
            getUserInfo(EXPO_PUBLIC_USER_INFO).then((info) => {
                if (info) {
                    const userData = JSON.parse(info);
                    if (userData.id) setUserID(userData.id);
                    getProfileImageCache().then(url => {
                        console.log("cache, yeeing", url);
                        setImage(url);
                        if (url === '' || url === undefined) {
                            console.log("tlqkf")
                            getProfilePhoto(userData.id)
                                .then((data) => {
                                    try {
                                        console.log("pfpicture getProfilePhoto ", data.url);
                                        setImage(data.url);
                                        setProfileImageCache(data.url);
                                    } catch {
                                        setImage('default');
                                        setProfileImageCache('default');
                                    }
                                });
                        }
                    })
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
                            setProfileImageCache(data.url);
                        } catch {
                            setImage('default');
                            setProfileImageCache('default');
                        }
                    });
            }
        });
    }, [temp_image]);

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
                {image !== 'default' ? (<Image source={{uri: image}}
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