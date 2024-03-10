import {Dimensions, Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import KickIcon from "../../assets/kick.webp";

const {width, height} = Dimensions.get('window');


const DailyPrompt = ({size}) => {
    return (
        <View style={{
            width: width * 0.9,
            height: height * 0.15,
            borderRadius: 25,
            borderWidth: 5,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Text style={{
                fontWeight: 'bold',
                fontSize: 30,
            }}>
                DAILY PROMPT:
            </Text>
            <Text style={{
                fontWeight: 'bold',
                fontSize: 30,
            }}>
                Prompt here
            </Text>
            <Text style={{
                fontWeight: 'bold',
                fontSize: 30,
            }}>
                Time Left
            </Text>
        </View>
    )
}

export default DailyPrompt