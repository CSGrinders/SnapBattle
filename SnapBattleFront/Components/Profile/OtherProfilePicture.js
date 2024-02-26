import {View} from "react-native";
import {Image} from 'expo-image';
import default_image_source from '../../assets/default-profile-picture.webp'

/**
 * @returns {JSX.Element} - Other users Profile pictures
 */
const OtherProfilePicture = ({size, searchID, imageUrl}) => {
    return (
        <View>
            {imageUrl!=='' ? (<Image source={{uri: imageUrl}}
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

export default OtherProfilePicture;