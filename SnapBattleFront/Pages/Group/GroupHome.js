import {
    View,
    Text,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Pressable,
    TouchableOpacity,
    RefreshControl, ScrollView, Modal
} from "react-native";
import {Button} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import Logo from "../../assets/logo.webp";
import Chat from "../../assets/chat.webp";
import Camera from "../../assets/camera.webp";
import Group from "../../assets/group.webp";
import Vote from "../../assets/thumbs-up.webp"
import Calendar from "../../assets/calendar.webp"
import {Image} from "expo-image";
import LeaderBoard from '../../assets/Leaderboard.webp';
import DailyPrompt from "../../Components/DailyPrompt/DailyPrompt";
import PostComponent from "../../Components/DailyPrompt/PostComponent";
import React, {useCallback, useContext, useEffect, useLayoutEffect, useState} from "react";
import axios from "axios";
import {useFocusEffect, useIsFocused} from "@react-navigation/native";
import {useCountdown} from "../../Components/DailyPrompt/useCountdown";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import {SocketContext} from "../../Storage/Socket";
import GroupBackButton from "../../Components/Button/GroupBackButton";
import CloseButton from "../../assets/close.webp";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env;

function GroupHome({route, navigation}) {
    const {username, userID, groupID, token} = route.params
    const {width, height} = Dimensions.get('window');
    const [prompt, setPrompt] = useState("")
    const [promptID, setPromptID] = useState("")
    const [loading, setLoading] = useState(true);

    /*
        PERIOD 0 = waiting period (have not reached submission period yet)
        PERIOD 1 = submission period (users can submit posts)
        PERIOD 2 = daily voting period (users can do their daily vote)
        PERIOD 3 = weekly voting period
        PERIOD 4 = results period - same as waiting period
    */
    const [period, setPeriod] = useState(0)

    //timeEnd = the time of the next period; initially set to more than 1 day in the future
    //          1 day in the future will render LOADING -> this is done to prevent errors with negatives :)
    const [timeEnd, setTimeEnd] = useState(new Date(Date.now() + 48 * 60 * 60 * 1000))

    //boolean whose change will refresh the page
    const [refresh, setRefresh] = useState(false)
    function handleRefresh() {
        setRefresh((refresh) => !refresh)
    }

    //elements for the timer
    const [days, hours, minutes, seconds] = useCountdown(timeEnd, handleRefresh)

    //array of post objects
    const [posts, setPosts] = useState([])

    //index of current post in carousel
    const [activeIndex, setActiveIndex] = useState(0)
    const [activePostID, setActivePostID] = useState("")

    //opacity of camera
    const [camOpacity, setCamOpacity] = useState(0.5)

    //variables for the info pop-up
    const [infoMessage, setInfoMessage] = useState("")
    const [infoState, setInfoState] = useState(false)
    const {leaveRoom } = useContext(SocketContext);
    const [errorMessageServer, setErrorMessageServer] = useState('');
    const [errorServer, setErrorServer] = useState(false);

    //gets the prompt object and underlying post and comment data
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(0);
    const refreshCooldown = 10000;

    const onRefresh = useCallback(() => {
        const now = Date.now();
        if (now - lastRefresh < refreshCooldown) {
            console.log('Refresh cooldown is active. ');
            return;
        }
        setRefreshing(true);
        getPrompts()
            .finally(() => {
                setRefreshing(false);
                setLastRefresh(Date.now());
            });
    }, [lastRefresh]);


    useFocusEffect(
        useCallback(() => {
            getPrompts()
                .finally(() => {
                    console.log("GetPrompt " + Date.now());
                });
        }, [refresh])
    )

    function getPrompts() {
        return axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/get-prompt`
        )
            .then((res) => {

                //if in weekly voting period, promptObj is not used but dailyWinningPosts is used
                //otherwise, promptObj is used but dailyWinningPosts is not used
                const {promptObj, dailyWinnerPosts, submissionAllowed, period, timeEnd} = res.data

                setPeriod(period)
                setTimeEnd(timeEnd)
                if (submissionAllowed) {
                    setCamOpacity(1)
                }
                else {
                    setCamOpacity(0.5)
                }


                //do this anytime you are not in weekly voting
                if (period !== 3) {
                    if (promptObj === null) {
                        setPrompt("Prompt has not been released yet")
                    }
                    else {
                        setPrompt(promptObj.prompt)
                        setPromptID(promptObj._id)
                        setPosts(promptObj.posts)
                        setLoading(false);
                        if (promptObj.posts.length > 0 && activePostID === "") {
                            setActivePostID(promptObj.posts[0]._id)
                        }
                    }
                }

                //weekly voting procedure
                else if (period === 3) {
                    setPosts(dailyWinnerPosts)

                    //no daily winner posts
                    if (dailyWinnerPosts.length === 0) {
                        setPrompt("No daily winners in the past 7 days :(")
                        setPromptID("")
                    }
                    else {
                        if (activeIndex < dailyWinnerPosts.length) {
                            setPrompt(dailyWinnerPosts[activeIndex].prompt.prompt)
                            setPromptID(dailyWinnerPosts[activeIndex].prompt._id)
                            setActivePostID(dailyWinnerPosts[activeIndex]._id)
                        }
                        else {
                            setActiveIndex(0)
                            setPrompt(dailyWinnerPosts[0].prompt.prompt)
                            setPromptID(dailyWinnerPosts[0].prompt._id)
                            setActivePostID(dailyWinnerPosts[0]._id)
                        }

                    }
                }
            })
            .catch((err) => {
                console.log("Group Home page: " + err);
                if (err && err.response) {
                    const {data} = err.response
                    setErrorMessageServer(data.errorMessage);
                    setErrorServer(true);
                    leaveRoom(userID, groupID);
                    setTimeout(() => {
                        navigation.navigate("Main", {userID: userID})
                    }, 1500)
                }
            })
    }


    function clickCamera() {
        if (camOpacity === 0.5) {
            setInfoMessage("You used all 3 submissions already")
            setInfoState(true)
        }
        else {
            navigation.navigate('Camera', route.params)
        }
    }

    function clickVoteDaily() {
        console.log("daily voting for post #" + activeIndex + ", with post ID of " + activePostID)
        console.log("prompt id is " + promptID)

        //no posts to vote for
        if (activePostID === "") {
            return
        }

        //BACKEND handles voting for same post and also voting for one post and then changing vote to another post
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/vote-daily`,
            {
                promptID: promptID,
                postID: activePostID
            }
        ).then(res => {
            const {differentPost} = res.data
            if (!differentPost) {
                console.log("user tried to vote for the same post")
                setErrorMessageServer("You cannot vote for the same post twice");
                setErrorServer(true);
            }
            else {
                //reload page with new vote counts
                console.log("reloading page with new vote counts")
                getPrompts()
            }
        })
    }

    function clickVoteWeekly() {
        console.log("weekly voting for post #" + activeIndex + ", with post ID of " + activePostID)
        console.log("prompt id is " + promptID)

        //no posts to vote for
        if (activePostID === "") {
            return
        }

        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/vote-weekly`,
            {
                posts: posts,
                votePostID: activePostID
            }
        ).then(res => {
            const {differentPost} = res.data
            if (!differentPost) {
                console.log("user tried to vote for the same post")
                setErrorMessageServer("You cannot vote for the same post twice");
                setErrorServer(true);
            }
            else {
                //reload page with new vote counts
                console.log("reloading page with new vote counts")
                getPrompts()
            }
        })
    }

    return (
        <View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: height * 0.15,
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start',
                    width: width * 0.15,
                    paddingBottom: 20,
                }}>
                    <GroupBackButton size={50} navigation={navigation} userID={userID} leaveRoom={leaveRoom} groupID={groupID}/>
                </View>
                <View style={{width: width * 0.7, justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={{
                        width: 105,
                        height: 105,
                        top: 15,
                    }} source={Logo}></Image>
                </View>
                <View style={{marginRight: 10, marginBottom: 15}}>
                    <TouchableOpacity onPress={() => navigation.navigate("Profile",
                        {
                            userID: userID
                        })}>
                        <ProfilePicture size={50} userID={userID} currentUserID={userID}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{
                width: width,
                height: height * 0.18,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <DailyPrompt prompt={prompt} period={period} days={days} hours={hours} minutes={minutes} seconds={seconds}/>
            </View>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={{
                    width: width,
                    alignItems: 'center',
                    height: height * 0.55
                }}>
                    <PostComponent posts={posts} route={route} navigation={navigation} activeIndex={activeIndex} setActiveIndex={setActiveIndex}
                                   setActivePostID={setActivePostID} setPrompt={setPrompt} setPromptID={setPromptID} period={period} loading={loading}/>
                </View>
            </ScrollView>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                height: height * 0.1
            }}>
                <TouchableOpacity onPress={() => navigation.navigate('GroupChat', route.params)}>
                    <Image
                        style={{width: 35, height: 35}}
                        source={Chat}
                        contentFit="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Leaderboard', route.params)}>
                    <Image
                        style={{width: 35, height: 35}}
                        source={LeaderBoard}
                        contentFit="contain"
                    />
                </TouchableOpacity>
                {period === 1 ?
                    (<TouchableOpacity
                        style={{opacity: camOpacity}}
                        onPress={clickCamera}>
                        <Image
                            style={{width: 62, height: 62}}
                            source={Camera}
                            contentFit="contain"
                        />
                    </TouchableOpacity>)
                    :
                    <></>
                }
                {period === 2 && posts[activeIndex] !== undefined ?
                    (<TouchableOpacity
                        onPress={clickVoteDaily}
                        style={{alignItems: 'center'}}>
                        <Image
                            style={{width: 75, height: 60}}
                            source={Vote}
                            contentFit="contain"
                        />
                        <Text>{posts[activeIndex].dailyVotes.length} votes</Text>
                    </TouchableOpacity>)
                    :
                    <></>
                }
                {period === 3 && posts[activeIndex] !== undefined ?
                    (<TouchableOpacity
                        onPress={clickVoteWeekly}
                        style={{alignItems: 'center'}}>
                        <Image
                            style={{width: 75, height: 60}}
                            source={Vote}
                            contentFit="contain"
                        />
                        <Text>{posts[activeIndex].weeklyVotes.length} votes</Text>
                    </TouchableOpacity>)
                    :
                    <></>
                }
                <TouchableOpacity onPress={() => navigation.navigate('Memories', route.params)}>
                    <Image
                        style={{width: 35, height: 35}}
                        source={Calendar}
                        contentFit="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('GroupMembers', route.params)}>
                    <Image
                        style={{width: 40, height: 40}}
                        source={Group}
                        contentFit="contain"
                    />
                </TouchableOpacity>
            </View>
            <InfoPrompt Message={infoMessage} state={infoState} setEnable={setInfoState}></InfoPrompt>
            <ErrorPrompt Message={errorMessageServer} state={errorServer} setError={setErrorServer}></ErrorPrompt>
        </View>
    )
}

export default GroupHome;