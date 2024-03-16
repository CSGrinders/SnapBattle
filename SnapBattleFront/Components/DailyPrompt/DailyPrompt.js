import {Dimensions, Text, TouchableOpacity, View} from "react-native";
import {useCallback, useState} from "react";
import {useFocusEffect} from "@react-navigation/native";
import CountDownTimer from "react-native-countdown-timer-hooks";

const {width, height} = Dimensions.get('window');


const DailyPrompt = ({prompt, timeStart, timeEnd}) => {

    const [secondsLeft, setSecondsLeft] = useState(0)

    useFocusEffect(
        useCallback(() => {
            const now = new Date()
            if (timeEnd !== null && now.getTime() <= timeEnd.getTime()) {
                setSecondsLeft(Math.abs(now.getTime() - timeEnd.getTime()) / 1000)
            }
        }, [timeEnd])
    )

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
            <Text style={{
                fontWeight: 'bold',
                fontSize: 30,
            }}>
                Seconds left: {secondsLeft}
            </Text>

        </View>
    )
}


export default DailyPrompt