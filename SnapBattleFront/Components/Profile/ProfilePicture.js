import {View} from "react-native";
import {Image} from 'expo-image';
import default_image_source from '../../assets/default-profile-picture.png'


const ProfilePicture = ({source, size}) => {
    if (source == null) {

    } else {

    }
    return (
        <View>
            {source ? (<Image source={source}
                              style={{
                                  width: size,
                                  height: size,
                              }}
            />) : (<Image source={default_image_source}
                          style={{
                              width: size,
                              height: size,
                          }}
            />)}

        </View>
    )
}

export default ProfilePicture