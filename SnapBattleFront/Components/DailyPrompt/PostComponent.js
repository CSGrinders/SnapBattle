import {Dimensions, FlatList, Text, View, Image, TouchableOpacity, Pressable, Modal, Share} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import Carousel from "react-native-snap-carousel";
import OtherProfilePicture from "../Profile/OtherProfilePicture";

const {width, height} = Dimensions.get('window');
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env;
import ShareIcon from "../../assets/share.webp"
import CommentIcon from "../../assets/comment.webp"
import LikeIcon from "../../assets/heart.webp"
import OptionsIcon from "../../assets/dotdotdot.webp"
import CloseButton from "../../assets/close.webp";
import {Button, Switch} from "@rneui/themed";
import axios from "axios";

const PostComponent = ({posts, route, navigation, activeIndex, setActiveIndex, setActivePostID, loading, period, setPrompt, setPromptID}) => {

    const {username, userID, groupID, token} = route.params;
    const [option, setOption] = useState(false);
    const [indexP, setIndex] = useState(0);
    const [commentStatus, setCommentStatus] = useState(false);
    const [postID, setPostID] = useState(false);
    const [isCooldownActive, setIsCooldownActive] = useState(false);
    const [cooldownTimer, setCooldownTimer] = useState(0);
    const [disable, setDisable] = useState(false);

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

    const renderPageView = () => {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                {posts.map((_, index) => (
                    <Text
                        key={index}
                        style={{
                            fontSize: 12,
                            color: index === activeIndex ? 'black' : 'gray',
                            margin: 3,
                        }}>
                        ●
                    </Text>
                ))}
            </View>
        );
    };


    function toggleComment(value, id) {
        if (isCooldownActive) {
            console.log("Cooldown active.");
            return;
        }

        setIsCooldownActive(true);
        setCooldownTimer(10);
        posts[indexP].commentsAllowed = value;
        axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/toggle-comments/${id}`, {
            postID: postID,
            userID: userID,
            commentsAllowed: value
        })
            .then((res) => {
                console.log("Comments Status for a Post Changed");
            })
            .catch((err) => {
                console.log(err)
            }).finally(() => {
            setTimeout(() => {
                setIsCooldownActive(false);
                setDisable(false);
            }, 10000);
        });
    }

    useEffect(() => {
        let interval = null;

        if (isCooldownActive && cooldownTimer !== 0) {
            interval = setInterval(() => {
                setCooldownTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (!isCooldownActive && cooldownTimer === 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isCooldownActive, cooldownTimer]);

    const ref = useRef(null)

    //each item is a post w/ the same attributes as a post object in MongoDB
    function renderItem({item, index}) {
        return (
            <View style={{
                height: "100%",
                borderRadius: 25
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
                        <OtherProfilePicture size={50} imageUrl={item.owner.profilePicture}/>
                        <View style={{flexDirection: 'column'}}>
                            <Text>{item.owner.username}</Text>
                            <Text>{new Date(item.time).getHours() + ":" + new Date(item.time).getMinutes()}</Text>
                        </View>
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 5
                        }}>
                            <TouchableOpacity onPress={() => openComments(index)}>
                                <Image
                                    source={CommentIcon}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        marginRight: 5
                                    }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onShare(item.picture)}>
                                <Image
                                    source={ShareIcon}
                                    style={{
                                        width: 30,
                                        height: 30
                                    }}
                                />
                            </TouchableOpacity>
                            {
                                item.owner._id === userID ?
                                    <TouchableOpacity onPress={() => {
                                        setOption(true)
                                        setPostID(item._id);
                                        setIndex(index)
                                        setCommentStatus(item.commentsAllowed);
                                    }}>
                                        <Image
                                            source={OptionsIcon}
                                            style={{
                                                width: 30,
                                                height: 30
                                            }}
                                        />
                                    </TouchableOpacity> : <></>
                            }
                        </View>
                    </View>
                </View>
                <Image
                    source={{uri: item.picture}}
                    style={{
                        width: width * 0.9 - 10,
                        height: (1.2) * (width * 0.9 - 10),
                    }}
                />
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={option}
                    onRequestClose={() => {
                        setOption(false);
                        setState(false);
                    }}
                >
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <View style={{
                            backgroundColor: 'white',
                            borderColor: 'black',
                            borderWidth: 2,
                            borderRadius: 8,
                            padding: 10,
                        }}>
                            <Pressable onPress={() => {
                                setOption(false)
                            }}>
                                <Image
                                    source={CloseButton}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        marginLeft: 'auto',
                                    }}
                                    rcontentFit="cover"
                                    transition={500}
                                />
                            </Pressable>
                            <Text style={{fontSize: 30, fontFamily: 'OpenSansBold', textAlign: 'center'}}>
                                Post Options
                            </Text>
                            <View style={{
                                flex: 0,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                            }}>
                                <Text style={{
                                    fontSize: 20,
                                    marginRight: 10,
                                    paddingTop: 5,
                                    fontWeight: 'bold'
                                }}>
                                    Comments Allowed
                                </Text>
                                <Switch
                                    value={commentStatus}
                                    onValueChange={(value) => {
                                        if (!isCooldownActive) {
                                            setCommentStatus(value);
                                            toggleComment(value, postID);
                                        } else {
                                            setDisable(true);
                                        }
                                    }}
                                    disabled={disable}
                                />
                            </View>
                            {(isCooldownActive && disable) && (
                                <Text style={{textAlign: 'center', marginTop: 10}}>
                                    Please wait {cooldownTimer} seconds.
                                </Text>
                            )}
                        </View>
                    </View>

                </Modal>
            </View>
        )
    }

    //opens the comment section for the post at the given index in the posts array
    function openComments(index) {
        console.log("opening comments section for post #" + index)
        console.log("postID: ", posts[index]._id)
        navigation.navigate('Comments', {username, userID, groupID, token, postID: posts[index]._id})
    }


    //conditionally render nothing or the posts carousel depending if there are posts or not
    if (posts === null || posts.length === 0) {
        return (
            <View style={{
                width: width * 0.9,
                height: "100%",
                //borderWidth: 5,
                justifyContent: 'center',
                alignItems: 'center',

            }}>
                {loading ?
                    <Text style={{
                        color: 'grey',
                        fontWeight: 'bold',
                        fontSize: 25,
                    }}>Loading...</Text> :
                    <Text style={{
                        color: 'grey',
                        fontWeight: 'bold',
                        fontSize: 25,
                    }}>No posts</Text>}
            </View>
        )
    } else {
        return (
            <View style={{
                height: "100%",
                //borderWidth: 5,
            }}>
                <Carousel
                    layout="default"
                    ref={ref}
                    data={posts}
                    sliderWidth={width * 0.9 - 10}
                    itemWidth={width * 0.9 - 10}
                    renderItem={renderItem}
                    onSnapToItem={(index) => {
                        setActiveIndex(index)
                        setActivePostID(posts[index]._id)

                        //weekly voting -> need to change prompt
                        if (period === 3) {
                            setPrompt(posts[index].prompt.prompt)
                            setPromptID(posts[index].prompt._id)
                        }
                    }}
                    vertical={false}
                />
                {renderPageView()}

            </View>
        )
    }

}

export default PostComponent