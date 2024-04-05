import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Text,
    View,
} from "react-native";
import { Button } from '@rneui/themed';
import {useCallback, useContext, useState} from "react";
import {Calendar, LocaleConfig} from 'react-native-calendars';
import CloseButton from "../../assets/close.webp"
import axios from "axios";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN} = process.env
import {useFocusEffect} from "@react-navigation/native";
import uuid from 'react-native-uuid'
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import GroupMemberInfoCard from "../../Components/Group/GroupMemberInfo";
import BackButton from "../../Components/Button/BackButton";
import {getUserInfo} from "../../Storage/Storage";
import ConfirmPrompt from "../../Components/Prompts/ConfirmPrompt";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import {SocketContext} from "../../Storage/Socket";

function Memories({route, navigation}) {

    const {userID, groupID, token} = route.params;
    const {width, height} = Dimensions.get('window');

    //state for whether the invite box is open or not
    const [invBoxVisible, setInvBoxVisibility] = useState(false);

    //state for the username to be invited to the group
    const [invUser, setInvUser] = useState("");

    //state for group invite status message
    const [invStatusMsg, setInvStatusMsg] = useState("");
    const [invStatusColor, setInvStatusColor] = useState("green");

    // type of viewing
    const [dailySelected, setDailySelected] = useState(true);

    const [selected, setSelected] = useState('');

    //Server error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    // info prompt
    const [successMessage, setSuccessMessage] = useState('');
    const [successState, setSuccessState] = useState(false)

    return (
        <View style={{
            alignItems: 'center'
        }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginTop: 70,
                marginBottom: 5
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={40} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 55}}>
                    <Text style={{fontSize: 30, fontFamily: 'OpenSansBold'}}>Memories</Text>
                </View>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginBottom: 10,
                gap: 10
            }}>
                <Button
                    title="Daily"
                    type={dailySelected ? "solid" : "outline"}
                    color="black"
                    buttonStyle={{
                        width: 80,
                        height: 45,
                        borderRadius: 35,
                    }}
                    containerStyle={{
                        marginTop: 5,
                        marginLeft: 10,
                        marginBottom: 5,
                        width: 80,
                        height: 45,
                    }}
                    titleStyle={{ fontSize: 15, fontWeight: 'bold', fontFamily: 'OpenSans' }}
                    onPress={() => setDailySelected(true)}
                />
                <Button
                    title="Weekly"
                    type={dailySelected ? "outline" : "solid"}
                    color="black"
                    buttonStyle={{
                        width: 80,
                        height: 45,
                        borderRadius: 35,
                    }}
                    containerStyle={{
                        marginTop: 5,
                        marginRight: 10,
                        marginBottom: 5,
                        width: 80,
                        height: 45,
                    }}
                    titleStyle={{ fontSize: 15, fontWeight: 'bold', fontFamily: 'OpenSans' }}
                    onPress={() => setDailySelected(false)}
                />
            </View>
            <Calendar
                style={{
                    width: width * 0.9,
                }}
                onDayPress={day => {
                    setSelected(day.dateString);
                }}
                markedDates={{
                    [selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
                }}
            />

            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
            <InfoPrompt Message={successMessage} state={successState} setEnable={setSuccessState}></InfoPrompt>
        </View>
    )
}

export default Memories;
