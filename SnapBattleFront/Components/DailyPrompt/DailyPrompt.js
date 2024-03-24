import {Dimensions, Text, TouchableOpacity, View} from "react-native";
import {useCallback, useState} from "react";
import {useFocusEffect} from "@react-navigation/native";
import CountDownTimer from "react-native-countdown-timer-hooks";
import {useCountdown} from "./useCountdown";

const {width, height} = Dimensions.get('window');


const DailyPrompt = ({prompt, timeStart, timeEnd}) => {

    const [secondsLeft, setSecondsLeft] = useState(0)
    const [days, hours, minutes, seconds] = useCountdown(timeEnd)

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
                {prompt}
            </Text>
            {hours >= 0 ?
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 30,
                }}>
                    Time left: {hours}:{minutes}:{seconds}
                </Text> :
                <></>
            }


        </View>
    )
}


export default DailyPrompt