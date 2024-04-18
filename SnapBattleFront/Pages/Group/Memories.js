import {
    Dimensions, Text, View, TouchableOpacity, Share, ScrollView, SafeAreaView,
} from "react-native";
import {Calendar} from 'react-native-calendars';
import {Image} from "expo-image";
import {Button} from "@rneui/themed";
import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import {useRef} from 'react'
import scrollUp from "../../assets/sendMessage.webp";


const {EXPO_PUBLIC_API_URL} = process.env
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import BackButton from "../../Components/Button/BackButton";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import OtherProfilePicture from "../../Components/Profile/OtherProfilePicture";
import ShareIcon from "../../assets/share.webp";
import {SocketContext} from "../../Storage/Socket";

function Memories({route, navigation}) {

    const scrollViewRef = useRef()

    const {userID, groupID} = route.params;
    const {width, height} = Dimensions.get('window');

    // type of viewing
    const [dailySelected, setDailySelected] = useState(true);

    const [selected, setSelected] = useState('');

    const [startWeek, setStartWeek] = useState('');

    const [endWeek, setEndWeek] = useState('');

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
    const {leaveRoom} = useContext(SocketContext);
    const [showScrollToTop, setShowScrollToTop] = useState(false);

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollToTop(offsetY > 200);
    };

    const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };


    function getLastDailyWinner() {
        setDailyWinnerPost(null);
        setDailyWinnerPrompt(null);
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-last-daily-winner`
        )
            .then((res) => {
                const {promptObj, dailyWinnerPostObj, dayString} = res.data
                setDailyWinnerPrompt(promptObj);
                setDailyWinnerPost(dailyWinnerPostObj);
                setSelected(dayString);
            })
            .catch((err) => {
                console.log("Memories page: " + err);
                if (err && err.response) {
                    const {data, status} = err.response;
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                    if (status === 404) {
                        leaveRoom(userID, groupID);
                        setTimeout(() => {
                            navigation.navigate("Main", {userID: userID})
                        }, 1500)
                    }
                }
            })
    }

    useEffect(() => {
        setTimeout(() => {scrollViewRef.current?.scrollToEnd({animated: true})}, 100)
    }, [dailyWinnerPrompt, weeklyWinnerPrompt])

    function getLastWeeklyWinner(){
        setWeeklyWinnerPost(null);
        setWeeklyWinnerPrompt(null);
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-last-weekly-winner`
        )
            .then((res) => {
                const {weeklyWinnerPost, dayString, startString, endString} = res.data
                setWeeklyWinnerPost(weeklyWinnerPost);
                setWeeklyWinnerPrompt(weeklyWinnerPost.prompt);
                setSelected(dayString)
                setStartWeek(startString);
                setEndWeek(endString);
            })
            .catch((err) => {
                console.log("Memories page: " + err);
                if (err && err.response) {
                    const {data, status} = err.response;
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                    setWeeklyWinnerPost(null);
                    setWeeklyWinnerPrompt(null);
                    if (status === 404) {
                        leaveRoom(userID, groupID);
                        setTimeout(() => {
                            navigation.navigate("Main", {userID: userID})
                        }, 1500)
                    }
                }
            })
    }

    function getDailyWinner(dayString) {
        setDailyWinnerPrompt(null);
        setDailyWinnerPost(null);
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
            .catch((err) => {
                console.log("Memories page: " + err);
                if (err && err.response) {
                    const {data, status} = err.response;
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                    setDailyWinnerPost(null);
                    setDailyWinnerPrompt(null);
                    if (status === 404) {
                        leaveRoom(userID, groupID);
                        setTimeout(() => {
                            navigation.navigate("Main", {userID: userID})
                        }, 1500)
                    }
                }
            })
    }

    function getWeeklyWinner(dayString) {
        setWeeklyWinnerPrompt(null);
        setWeeklyWinnerPost(null);
        console.log("getting weekly winner for " + dayString);
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-weekly-winner/${dayString}`
        )
            .then((res) => {
                const {weeklyWinnerPost, startString, endString} = res.data
                setWeeklyWinnerPost(weeklyWinnerPost);
                setWeeklyWinnerPrompt(weeklyWinnerPost.prompt);
                setStartWeek(startString);
                setEndWeek(endString);
            })
            .catch((err) => {
                console.log("Memories page: " + err);
                if (err && err.response) {
                    const {data, status} = err.response;
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                    setWeeklyWinnerPost(null);
                    setWeeklyWinnerPrompt(null);
                    if (status === 404) {
                        leaveRoom(userID, groupID);
                        setTimeout(() => {
                            navigation.navigate("Main", {userID: userID})
                        }, 1500)
                    }
                }
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const amPm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12; // Converts 0 to 12 for 12-hour format
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${amPm}`;
    };

    return (
        <SafeAreaView style={{flex: 1}}>
        <View style={{
            alignItems: 'center',
        }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginBottom: 5
            }}>
                <View style={{
                    paddingLeft: 15,
                    paddingTop: 5,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 32}}>
                    <Text style={{fontSize: 30, fontFamily: 'OpenSansBold'}}>Memories</Text>
                </View>
                <View style={{paddingTop: 20}}>
                    <Button
                        onPress={() => dailySelected ? getLastDailyWinner() : getLastWeeklyWinner()}
                        type="outline"
                        title="Most Recent"
                        titleStyle={{ fontSize: 10, fontWeight: 'bold' }}
                        buttonStyle={{
                            width: 80,
                            height: 35,
                            borderRadius: 40,
                        }}
                        containerStyle={{
                            marginTop: 2,
                            marginRight: 10,
                            marginBottom: 2,
                            width: 80,
                            height: 45,
                        }} />
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
                    onPress={() => {
                        setDailySelected(true)
                        setSelected("")
                        setDailyWinnerPrompt(null)
                        setDailyWinnerPost(null)
                        setWeeklyWinnerPrompt(null)
                        setWeeklyWinnerPost(null)
                    }}
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
                    onPress={() => {
                        setDailySelected(false)
                        setSelected("")
                        setDailyWinnerPrompt(null)
                        setDailyWinnerPost(null)
                        setWeeklyWinnerPrompt(null)
                        setWeeklyWinnerPost(null)
                    }}
                />
            </View>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                ref={scrollViewRef}
                onScroll={handleScroll}
                style={{marginBottom: 10}}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
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
                        console.log(selected.toString())
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
                        <Text style={{
                            fontWeight: 'bold',
                            fontSize: 17,
                        }}>
                            DAY: {selected}
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
                        <Text style={{
                            fontWeight: 'bold',
                            fontSize: 17,
                        }}>
                            WEEK: {startWeek} - {endWeek}
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
                            marginBottom: height * 0.18
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
                                        <Text>{formatDate(dailyWinnerPost.time)}</Text>
                                    </View>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: 5
                                    }}>
                                        <Text>{dailyWinnerPost.dailyVotes.length} Votes</Text>
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
                        marginBottom: height * 0.18
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
                                    <Text>{formatDate(weeklyWinnerPost.time)}</Text>
                                </View>
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: 5
                                }}>
                                    <Text>{weeklyWinnerPost.weeklyVotes.length} Votes</Text>
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
                                height: (1.2) * (width * 0.9 - 2),
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
            {showScrollToTop &&
            <TouchableOpacity
                onPress={scrollToTop}
                style={{
                    position: 'absolute',
                    bottom: 20,
                    alignSelf: 'center',
                    width: 50,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 25,
                    shadowOffset: { width: 1, height: 1 },
                    shadowColor: 'black',
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                }}
            >
                <Image
                    source={scrollUp}
                    style={{ width: 50, height: 50 }}
                />
            </TouchableOpacity>
            }
        </SafeAreaView>
    )
}

export default Memories;
