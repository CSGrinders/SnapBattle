import {TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import SendIcon from "../../assets/send-icon.png";

const BackButton = ({size, submitPressed}) => {
    return (
        <View>
            <TouchableOpacity onPress={submitPressed}>
                <Image source={SendIcon} style={{width:size, height:size}}></Image>
            </TouchableOpacity>
        </View>
    )
}

export default BackButton