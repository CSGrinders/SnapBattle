import {
    Dimensions, Text, View, TouchableOpacity, Share, ScrollView,
} from "react-native";
import {Calendar} from 'react-native-calendars';
import {Image} from "expo-image";
import {Button} from "@rneui/themed";
import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {useRef} from 'react'


const {EXPO_PUBLIC_API_URL} = process.env
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import BackButton from "../../Components/Button/BackButton";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import OtherProfilePicture from "../../Components/Profile/OtherProfilePicture";
import ShareIcon from "../../assets/share.webp";

function Memories({route, navigation}) {

    const scrollViewRef = useRef()

    const {userID, groupID} = route.params;
    const {width, height} = Dimensions.get('window');

    // type of viewing
    const [dailySelected, setDailySelected] = useState(true);

    const [selected, setSelected] = useState('');

    //Server error messages
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    // info prompt
    const [successMessage, setSuccessMessage] = useState('');
    const [successState, setSuccessState] = useState(false)

    const [dailyWinnerPrompt, setDailyWinnerPrompt] = useState(null);
    const [dailyWinnerPost, setDailyWinnerPost] = useState(null);
    const [weeklyWinnerPost, setWeeklyWinnerPost] = useState(null);
    const [weeklyWinnerPrompt, setWeeklyWinnerPrompt] = useState(null);

    function getLastDailyWinner() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-last-daily-winner`
        )
            .then((res) => {
                const {promptObj, dailyWinnerPostObj, dayString} = res.data
                setDailyWinnerPrompt(promptObj);
                setDailyWinnerPost(dailyWinnerPostObj);
                setSelected(dayString);
            })
            .catch((e) => {
                console.log(e.response.data)
                setErrorMessageServer(e.response.data.errorMessage)
                setErrorServer(true)
            })
    }

    useEffect(() => {
        setTimeout(() => {scrollViewRef.current?.scrollToEnd({animated: true})}, 100)
    }, [dailyWinnerPrompt, weeklyWinnerPrompt])

    function getLastWeeklyWinner(){
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-last-weekly-winner`
        )
            .then((res) => {
                const {weeklyWinnerPost, dayString} = res.data
                setWeeklyWinnerPost(weeklyWinnerPost);
                setWeeklyWinnerPrompt(weeklyWinnerPost.prompt);
                setSelected(dayString)
            })
            .catch((e) => {
                console.log(e.response.data);
                setErrorMessageServer(e.response.data.errorMessage)
                setErrorServer(true)
            })
    }

    function getDailyWinner(dayString) {
        console.log("getting daily winner for " + dayString);
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-daily-winner/${dayString}`
        )
            .then((res) => {
                const {promptObj, dailyWinnerPostObj, dayString} = res.data
                setDailyWinnerPrompt(promptObj);
                setDailyWinnerPost(dailyWinnerPostObj);
                setSelected(dayString);
            })
            .catch((e) => {
                console.log(e.response.data)
                setErrorMessageServer(e.response.data.errorMessage)
                setErrorServer(true)
            })
    }

    function getWeeklyWinner(dayString) {
        console.log("getting weekly winner for " + dayString);
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-weekly-winner/${dayString}`
        )
            .then((res) => {
                console.log(res)
            })
            .catch((e) => {
                console.log(e.response.data)
            })
    }

    const onShare = async (itemPictureURL) => {
        try {
            const result = await Share.share({
                url: itemPictureURL,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Share was successful');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share closed ');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <View style={{
            alignItems: 'center',
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
                    <Text style={{fontSize: 30, /*fontFamily: 'OpenSans'*/}}>Memories</Text>
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
                    titleStyle={{ fontSize: 15, fontWeight: 'bold', /*fontFamily: 'OpenSansBold'*/ }}
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
                    titleStyle={{ fontSize: 15, fontWeight: 'bold', /*fontFamily: 'OpenSans'*/ }}
                    onPress={() => setDailySelected(false)}
                />
            </View>
            <View style={{marginBottom: 10}}>
                {dailySelected ? (
                    <Button onPress={() => getLastDailyWinner()}>
                        View last daily winner
                    </Button>
                ) : (
                    <Button onPress={() => getLastWeeklyWinner()}>
                        View last weekly winner
                    </Button>
                )}
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} ref={scrollViewRef} style={{marginBottom: 10}}>
                <Calendar
                    style={{
                        width: width * 0.9,
                    }}
                    theme={{
                        backgroundColor: '#ffffff',
                        calendarBackground: '#f2f2f2',
                        textSectionTitleColor: '#b6c1cd',
                        selectedDayBackgroundColor: '#000000',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#f40000',
                        dayTextColor: '#515151',
                        textDisabledColor: '#c6c6c6',
                        arrowColor: '#000000'
                    }}
                    onDayPress={day => {
                        setSelected(day.dateString);
                        if (dailySelected) {
                            getDailyWinner(day.dateString)
                        }
                        else {
                            getWeeklyWinner(day.dateString)
                        }
                    }}
                    markedDates={{
                        [selected]: {selected: true, disableTouchEvent: true}
                    }}
                />

                {dailySelected && dailyWinnerPrompt !== null ? (
                    <View style={{
                        width: width * 0.9,
                        borderRadius: 25,
                        borderWidth: 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                        paddingVertical: 20
                    }}>
                        <Text style={{
                            fontSize: 20,
                            textAlign: 'center'
                        }}>
                            {dailyWinnerPrompt.prompt}
                        </Text>
                    </View>
                    ) : (<></>)
                }

                {!dailySelected && weeklyWinnerPrompt !== null ? (
                    <View style={{
                        width: width * 0.9,
                        borderRadius: 25,
                        borderWidth: 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                        paddingVertical: 20
                    }}>
                        <Text style={{
                            fontSize: 20,
                            textAlign: 'center'
                        }}>
                            {weeklyWinnerPrompt.prompt}
                        </Text>
                    </View>
                    ) : (<></>)
                }

                {dailySelected && dailyWinnerPost != null ? (
                    <View style={{flex: 1}}>
                        <View style={{
                            height: "100%",
                            borderRadius: 25,
                            marginTop: 20,
                            marginBottom: height * 0.3
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-around',
                            }}>
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    marginTop: 5,
                                    marginBottom: 5,
                                    marginLeft: 5,
                                    marginRight: 5,
                                    gap: 10
                                }}>
                                    <OtherProfilePicture size={50} imageUrl={dailyWinnerPost.owner.profilePicture}/>
                                    <View style={{flexDirection: 'column'}}>
                                        <Text>{dailyWinnerPost.owner.username}</Text>
                                        <Text>{new Date(dailyWinnerPost.time).getHours() + ":" + new Date(dailyWinnerPost.time).getMinutes()}</Text>
                                    </View>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: 5
                                    }}>
                                        <Text>? Votes</Text>
                                        <TouchableOpacity onPress={() => onShare(dailyWinnerPost.picture)}>
                                            <Image
                                                source={ShareIcon}
                                                style={{
                                                    width: 30,
                                                    height: 30
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <Image
                                source={{uri: dailyWinnerPost.picture}}
                                style={{
                                    width: width * 0.9 - 10,
                                    height: (1.2) * (width * 0.9 - 10),
                                }}
                            />
                        </View>
                    </View>
                ) : (<></>)
                }

            {!dailySelected && weeklyWinnerPost != null ? (
                <View style={{flex: 1}}>
                    <View style={{
                        height: "100%",
                        borderRadius: 25,
                        marginTop: 20,
                        marginBottom: height * 0.3
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                        }}>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                marginTop: 5,
                                marginBottom: 5,
                                marginLeft: 5,
                                marginRight: 5,
                                gap: 10
                            }}>
                                <OtherProfilePicture size={50} imageUrl={weeklyWinnerPost.owner.profilePicture}/>
                                <View style={{flexDirection: 'column'}}>
                                    <Text>{weeklyWinnerPost.owner.username}</Text>
                                    <Text>{new Date(weeklyWinnerPost.time).getHours() + ":" + new Date(weeklyWinnerPost.time).getMinutes()}</Text>
                                </View>
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: 5
                                }}>
                                    <Text>? Votes</Text>
                                    <TouchableOpacity onPress={() => onShare(weeklyWinnerPost.picture)}>
                                        <Image
                                            source={ShareIcon}
                                            style={{
                                                width: 30,
                                                height: 30
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <Image
                            source={{uri: weeklyWinnerPost.picture}}
                            style={{
                                width: width * 0.9 - 10,
                                height: (1.2) * (width * 0.9 - 10),
                            }}
                        />
                    </View>
                </View>
                ) :
                (<></>)
            }



                <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
                <InfoPrompt Message={successMessage} state={successState} setEnable={setSuccessState}></InfoPrompt>
            </ScrollView>
        </View>
    )
}

export default Memories;
