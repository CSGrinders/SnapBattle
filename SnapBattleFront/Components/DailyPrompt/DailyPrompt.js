import {Dimensions, Text, TouchableOpacity, View} from "react-native";
import {useCallback, useState} from "react";
import {useFocusEffect} from "@react-navigation/native";
import CountDownTimer from "react-native-countdown-timer-hooks";
import {useCountdown} from "./useCountdown";

const {width, height} = Dimensions.get('window');


const DailyPrompt = ({prompt, days, hours, minutes, seconds, period}) => {

    let periodText;
    if (period === 0) {
        periodText = "WAITING PERIOD"
    }
    else if (period === 1) {
        periodText = "SUBMISSION PERIOD"
    }
    else if (period === 2) {
        periodText = "DAILY VOTING PERIOD"
    }
    else if (period === 3) {
        periodText = "WEEKLY VOTING PERIOD"
    }
    else {
        periodText = "WAITING PERIOD"
    }
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return (
        <View style={{
            width: width * 0.9,
            height: height * 0.15,
            borderRadius: 25,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Text style={{
                fontWeight: 'bold',
                fontSize: 20,
                textAlign: 'center'
            }}>
                {periodText}
            </Text>
            <Text style={{
                fontSize: 20,
                textAlign: 'center'
            }}>
                {prompt}
            </Text>
            {days === 1 || hours < 0 ?
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                }}>
                    LOADING
                </Text> :
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                }}>
                    Time left: {hours}:{formattedMinutes}:{formattedSeconds}
                </Text>
            }


        </View>
    )
}


export default DailyPrompt