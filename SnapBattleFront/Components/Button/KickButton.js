import {TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import KickIcon from "../../assets/kick.webp";

const KickButton = ({size, onPress}) => {
    return (
        <View>
            <TouchableOpacity onPress={onPress} >
                <Image source={KickIcon} style={{width:size, height:size}}></Image>
            </TouchableOpacity>
        </View>
    )
}

export default KickButton