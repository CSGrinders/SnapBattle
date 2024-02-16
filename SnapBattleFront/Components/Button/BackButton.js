import {TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import BackIcon from "../../assets/back-icon.webp";

const BackButton = ({size}) => {
    const backPressed = () => {

    }

    return (
        <View>
            <TouchableOpacity onPress={backPressed}>
                <Image source={BackIcon} style={{width:size, height:size}}></Image>
            </TouchableOpacity>
        </View>
    )
}

export default BackButton