import {View} from "react-native";
import {Image} from 'expo-image';
import default_image_source from '../../assets/default-profile-picture.webp'


const ProfilePicture = ({source, size}) => {
    return (
        <View>
            {source ? (<Image source={{uri: source}}
                              style={{
                                  width: size,
                                  height: size,
                                  borderRadius: size/2,
                              }}
            />) : (<Image source={default_image_source}
                          style={{
                              width: size,
                              height: size,
                              borderRadius: size/2,
                          }}
            />)}

        </View>
    )
}

export default ProfilePicture