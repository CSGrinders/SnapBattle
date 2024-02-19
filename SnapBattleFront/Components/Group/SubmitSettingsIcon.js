import {TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import SendIcon from "../../assets/send-icon.webp";

const GroupSettingsSubmitIcon = ({size, submitPressed}) => {
    return (
        <TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={submitPressed}>
            <Image source={SendIcon} style={{width: size, height: size}}></Image>
        </TouchableOpacity>
    )
}

export default GroupSettingsSubmitIcon