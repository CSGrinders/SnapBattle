import {
    ActivityIndicator,
    Alert,
    Dimensions, KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
    RefreshControl,
} from "react-native";
import {Image} from "expo-image";
import {Button, Input} from "@rneui/themed";
import {useCallback, useContext, useState} from "react";
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

    //Server error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    // confirm prompt
    const [confirmMessage, setConfirmMessage] = useState('Are you sure you would like to kick this user?');
    const [confirmStatus, setConfirmStatus] = useState(false);

    // info prompt
    const [successMessage, setSuccessMessage] = useState('');
    const [successState, setSuccessState] = useState(false)

    //state for group members
    const [groupMembers, setGroupMembers] = useState([-1]);
    const [adminUser, setAdminUser] = useState("");

    // kick user
    const [kickUser, setKickUser] = useState("")

    const {socket, leaveRoom} = useContext(SocketContext);

    const [refreshPage, applyRefresh] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(0);
    const refreshCooldown = 10000;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
            enabled={false} style={{flex: 1, alignItems: "center"}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginTop: 70,
                marginBottom: 10
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

            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
            <InfoPrompt Message={successMessage} state={successState} setEnable={setSuccessState}></InfoPrompt>
            <ConfirmPrompt Message={confirmMessage} state={confirmStatus} setState={setConfirmStatus}
                           command={() => {
                               setConfirmStatus(false);
                               kickFunc();
                           }}>
            </ConfirmPrompt>
        </KeyboardAvoidingView>
    )
}

export default Memories;
