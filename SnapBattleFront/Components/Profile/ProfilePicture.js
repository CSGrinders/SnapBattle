import {View} from "react-native";
import {Image} from 'expo-image';
import default_image_source from '../../assets/default-profile-picture.webp'
import {useCallback, useState} from "react";
import {getProfileImageCache, getProfilePhoto, setProfileImageCache} from "../../Storage/Cloud";
import {useFocusEffect} from "@react-navigation/native";


/**
 * @returns {JSX.Element} - User profile picture
 */

const ProfilePicture = ({size, temp_image, userID}) => {

    const [image, setImage] = useState('');

    useFocusEffect(
        useCallback(() => {
            const url = getProfileImageCache()
            if (url === '' || url ===  undefined) {
                console.log("restart")
                console.log(`id: ${userID}`)
                getProfilePhoto(userID)
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
            setImage(url)
        }, [userID])
    )

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