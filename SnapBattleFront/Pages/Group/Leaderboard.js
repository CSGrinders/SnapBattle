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
import ProfilePicture from "../../Components/Profile/ProfilePicture";

function Leaderboard({route, navigation}) {

    const {userID, groupID, token} = route.params;
    const {width, height} = Dimensions.get('window');

    //const socket = useContext(SocketContext);
    const {leaveRoom } = useContext(SocketContext);
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    const [groupMembers, setGroupMembers] = useState([])
    const rankings = groupMembers.sort()
    const topThree = rankings.slice(0, 3)
    const restRanking = rankings.slice(3)

    const onRefresh = useCallback(() => {
        const now = Date.now();
        if (now - lastRefresh < refreshCooldown) {
            console.log('Refresh cooldown is active. ');
            return;
        }

        setRefreshing(true);
        getGroupMembers()
            .finally(() => {
                setRefreshing(false);
                setLastRefresh(Date.now());
            });
    }, [lastRefresh]);

    //getting information necessary for page display
    useFocusEffect(
        useCallback(() => {
            getGroupMembers();

        }, [])
    )

    //get user's list of groups
    function getGroupMembers() {
        return axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/list-users/${groupID}`
        )
            .then((res) => {
                setGroupMembers(res.data.list);
            })
            .catch((err) => {
                console.log("Members Home page: " + err);
                if (err.response) {
                    const {data} = err.response;
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                    leaveRoom(userID, groupID);
                    setTimeout(() => {
                        navigation.navigate("Main", {userID: userID})
                    }, 1500)
                }
            })
    }

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
                    <Text style={{fontSize: 30, fontFamily: 'OpenSansBold'}}>Leaderboard</Text>
                </View>
            </View>
            <View style={{
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
            }}>
                <View style={{
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * .9,
    marginBottom: 20,
    height: 100,
                }}>
        {topThree.map((player, index) => (
          <View key={index} style={[{    
            paddingVertical: 15,
            paddingHorizontal: 25,
            borderRadius: 8,
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            }, index === 0 ? {backgroundColor: '#ffc107'} : index === 1 ? {backgroundColor: '#e0e0e0'} : {backgroundColor: '#cd7f32'}]}>
            <ProfilePicture size={50} userID={userID} currentUserID={userID}/>
            <Text style={{
                    color: '#fff',
                    fontSize: 16,
            }}>{`${index + 1}. ${player.name}`}</Text>
            <Text style={{
                    color: '#fff',
                    fontSize: 16,
            }}>
                {`${player.score}`}
            </Text>
          </View>
        ))}
      </View>
      <View style={{
            width: width * .9,
            borderRadius: 8,
            padding: 20,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
            height: height * .6,
      }}>
        <ScrollView
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                        />
                                     } >
        <Text style={{
                marginBottom: 10,
                fontSize: 20,
                color: '#333',
        }}>Rest of the Ranking</Text>
        <View style={{
            paddingVertical: 5,
        }}>
          {restRanking.map((player, index) => (
            <View style={{
                paddingVertical: 10,
                paddingHorizontal: 15,
                borderRadius: 5,
                backgroundColor: '#f5f5f5',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                flexDirection: 'row',
                display: 'flex',
                alignItems: 'center',
                gap: 15
            }}>
                <ProfilePicture size={50} userID={player._id} currentUserID={player._id}/>
                <Text key={index}>{`${index + 4}. ${player.name} - ${player.score}`}</Text>
            </View>
          ))}
        </View>
        </ScrollView>
      </View>
    </View>
        </KeyboardAvoidingView>
    )
}

export default Leaderboard;
