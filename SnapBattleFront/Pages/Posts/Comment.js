import {
    View,
    Text,
    SafeAreaView,
    Dimensions,
    Image,
    FlatList,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity, Keyboard, TextInput, ScrollView
} from 'react-native'
import React, {useState, useEffect, useCallback, memo} from 'react'
import BackButton from '../../Components/Button/BackButton';
import axios, {post} from 'axios';
import {Input} from '@rneui/themed';
import sendMessage from "../../assets/sendMessage.webp";
import HeartIcon from "../../assets/heart.webp";
import OtherProfilePicture from "../../Components/Profile/OtherProfilePicture";
import CommentItem from "../../Components/DailyPrompt/CommentItem";
import {useFocusEffect} from "@react-navigation/native";

const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env;

const Comment = ({size, route, navigation}) => {
    const {width, height} = Dimensions.get('window');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const {username, userID, groupID, token, postID} = route.params;
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([])
    const [commentsEnabled, setCommentsEnabled] = useState(false)
    const [commentTyped, setCommentTyped] = useState('');
    const [commentToggle, setCommentToggle] = useState(false);
    const [replyToID, setReplyToID] = useState('');
    const [replyToUserName, setReplyToUserName] = useState('');
    const [editComment, setEditComment] = useState(false)
    const [editTyped, setEditTyped] = useState('');
    const [editCommentID, setEditCommentID] = useState();


    useFocusEffect(
        useCallback(() => {
            console.log("USESTATE 1")
            checkAllowedComments();
        }, [])
    )

    function getComments() {
        console.log("getComments Called")
        return axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/view-comments/${postID}`
        )
            .then((res) => {
                // console.log(res.data.comments)
                setComments(res.data.comments);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err)
            })
    }

    function checkAllowedComments() {
        console.log("checkAllocedComments Called")
        return axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/comments-allowed/${postID}`
        )
            .then((res) => {
                console.log("comments enabled:", res.data.commentsAllowed)
                setCommentsEnabled(res.data.commentsAllowed)
                if (res.data.commentsAllowed) {
                    getComments();
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }


    useEffect(() => {
        console.log("edit change")
        setReplyToID('');
        setReplyToUserName('');
    }, [editComment])

    const handleDeleteComment = (commentID) => {
        console.log("delete");
        axios.delete(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/delete-comment/${postID}/${commentID}`,
        )
            .then((res) => {
                console.log("after delete: ", res.data);
                setComments(res.data.comments);
            })
            .catch((err) => {
                console.log(err)
            })
    }


    const handleReplyTo = useCallback((item) => {
        console.log("replyTo clicked");
        setReplyToID(item._id);
        setReplyToUserName(item.userID.username);
        setEditComment(false);

        console.log("replyTo: ", item._id, item.userID.username);
    }, []); // Add any dependencies if necessary

    const handleCancelReply = () => {
        console.log("reply cancel clicked");
        setReplyToID('');
        setReplyToUserName('');
    }

    const handleEditComment = async (comment) => {
        if (comment !== '') {
            axios.post(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/edit-comment/${postID}`, {
                    userID: userID,
                    commentID: editCommentID,
                    content: comment
                }
            )
                .then((res) => {
                    console.log(res.data.comments)
                    setComments(res.data.comments);
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        setEditComment(false)
    }

    const handleSubmitComment = async (commentTyped) => {
        console.log("submit:", commentTyped);
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/create-comment/${postID}`,
            {
                commentBody: commentTyped,
                replyTo: replyToID // TODO
            }
        )
            .then((res) => {
                setCommentTyped('');
                setComments(res.data.comments)
                setCommentTyped('');
            })
            .catch((err) => {
                console.log(err)
                // something went wrong popup TODO
            })
    }

    const handleLikeComment = async () => {
        console.log("like");
    }

    const ReplyItem = ({item, userID}) => {
        console.log("reply Item component created");

        const handleLikeComment = async () => {
            console.log("like", item._id, userID);
            axios.post(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/post-like/${item.postID}/${item._id}`,
            )
                .then((res) => {
                    console.log("after like: ", res.data);
                    setComments(res.data.comments);
                })
                .catch((err) => {
                    console.log(err)
                })
        }

        const handleUnlikeComment = async () => {
            console.log("unlike", item._id, userID);
            axios.delete(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/delete-like/${item.postID}/${item._id}`,
            )
                .then((res) => {
                    console.log("after unlike: ", res.data);
                    setComments(res.data.comments);
                })
                .catch((err) => {
                    console.log(err)
                })
        }

        return (
            <View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginLeft: 50,
                    // backgroundColor: "#cccccc",
                }}>
                    <View style={{
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: width * 0.7,
                        gap: 30
                    }}>
                        <OtherProfilePicture size={35} imageUrl={item.userID.profilePicture}/>
                        {/*  item : {"__v": 0, "_id": "65ff108ba5677714cf610ad6", "body": "Looks good", "likes": 0, "postID": "65ff107ba5677714cf610ac9", "replyTo": null, "timestamp": "2024-03-23T17:23:40.297Z", "userID": {"__v": 7, "_id": "65edd46e90d6c3828ff7d772", "biography": "I love SnapBattle!", "blockedUsers": [], "email": "sohn5312@gmail.com", "friends": ["65edd52790d6c3828ff7d791", "65fb409b77e70d6ebd8d64c5"], "groups": ["65edd49d90d6c3828ff7d77d", "65fb40ea77e70d6ebd8d64d8"], "invites": [], "name": "yee", "numWins": 0, "password": "$2b$12$CX2qX4aomvVo.HvXFSxvM.YMDlN9XoJszQsV7UvohJ5KX1kql0p36", "profilePicture": "https://firebasestorage.googleapis.com/v0/b/snapbattle-firebase.appspot.com/o/profileImage%2F65edd46e90d6c3828ff7d772.jpeg?alt=media&token=2cb81fec-d630-4a2b-ab4b-03234bd7a370", "requests": [], "username": "yee"}}*/}
                        <View>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 'bold'
                                }}>
                                    {item.userID.username}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: 'grey',
                                }}>
                                    {item.timestamp}
                                </Text>
                            </View>
                            <Text>
                                {item.body}
                            </Text>
                            <View style={{flexDirection: 'row', gap: 10}}>
                                <TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={() => {
                                    handleReplyTo(item)
                                }}>
                                    <Text style={{marginTop: 5, fontSize: 12, fontFamily: 'OpenSansBold'}}>
                                        reply
                                    </Text>
                                </TouchableOpacity>
                                {item.userID._id === userID &&
                                    <TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={() => {
                                        setEditComment(!editComment)
                                        setEditTyped(item.body)
                                        setEditCommentID(item._id)
                                    }}>
                                        <Text style={{
                                            marginTop: 5,
                                            fontSize: 12,
                                            fontFamily: 'OpenSansBold',
                                            color: editComment && item._id === editCommentID ? '#0080FF' : 'black'
                                        }}>
                                            edit
                                        </Text>
                                    </TouchableOpacity>
                                }
                                {item.userID._id === userID &&
                                    <TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={() => {
                                        handleDeleteComment(item._id)
                                    }}>
                                        <Text style={{marginTop: 5, fontSize: 12, fontFamily: 'OpenSansBold'}}>
                                            delete
                                        </Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginRight: 15
                    }}>
                        <View style={{flexDirection: 'column', alignItems: 'center'}}>
                            {item.likes.includes(userID) ?
                                (<TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={handleUnlikeComment}>
                                    <Image source={HeartIcon} style={{width: 15, height: 15, tintColor: 'red'}}></Image>
                                </TouchableOpacity>)
                                :
                                (<TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={handleLikeComment}>
                                    <Image source={HeartIcon} style={{width: 15, height: 15}}></Image>
                                </TouchableOpacity>)}
                            <Text>{item.likes.length}</Text>
                        </View>
                    </View>
                </View>
                <View>
                    {/*<FlatList*/}
                    {/*    data = {replies}*/}
                    {/*    renderItem = {({ item }) => <ReplyItem item={item} userID={userID}/>}*/}
                    {/*    keyExtractor={(item, index) => index.toString()}*/}
                    {/*/>*/}
                </View>
            </View>)
    }

    const CommentItem = memo(({item, userID}) => {
        // console.log("commentItem likes: ", item);
        const [showReplies, setShowReplies] = useState(false);
        const [replies, setReplies] = useState([]);

        const handleLikeComment = async () => {
            // console.log("like", item._id, userID);
            axios.post(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/post-like/${item.postID}/${item._id}`,
            )
                .then((res) => {
                    console.log("after like: ", res.data);
                    setComments(res.data.comments);
                })
                .catch((err) => {
                    console.log(err)
                })
        }


        const handleUnlikeComment = async () => {
            // console.log("unlike", item._id, userID);
            axios.delete(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/delete-like/${item.postID}/${item._id}`,
            )
                .then((res) => {
                    console.log("after unlike: ", res.data);
                    setComments(res.data.comments);
                })
                .catch((err) => {
                    console.log(err)
                })
        }


        useEffect(() => {
            if (item.replyBy !== null && item.replyBy.length > 0) {
                setReplies(item.replyBy);
                // console.log("plse", item.replyBy);
            }
        }, [])

        const toggleReplies = () => {
            setShowReplies(!showReplies);
        };


        return (
            item.replyTo === null &&
            <View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                }}>
                    <View style={{
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: width * 0.7,
                        gap: 30
                    }}>
                        <OtherProfilePicture size={35} imageUrl={item.userID.profilePicture}/>
                        {/*  item : {"__v": 0, "_id": "65ff108ba5677714cf610ad6", "body": "Looks good", "likes": 0, "postID": "65ff107ba5677714cf610ac9", "replyTo": null, "timestamp": "2024-03-23T17:23:40.297Z", "userID": {"__v": 7, "_id": "65edd46e90d6c3828ff7d772", "biography": "I love SnapBattle!", "blockedUsers": [], "email": "sohn5312@gmail.com", "friends": ["65edd52790d6c3828ff7d791", "65fb409b77e70d6ebd8d64c5"], "groups": ["65edd49d90d6c3828ff7d77d", "65fb40ea77e70d6ebd8d64d8"], "invites": [], "name": "yee", "numWins": 0, "password": "$2b$12$CX2qX4aomvVo.HvXFSxvM.YMDlN9XoJszQsV7UvohJ5KX1kql0p36", "profilePicture": "https://firebasestorage.googleapis.com/v0/b/snapbattle-firebase.appspot.com/o/profileImage%2F65edd46e90d6c3828ff7d772.jpeg?alt=media&token=2cb81fec-d630-4a2b-ab4b-03234bd7a370", "requests": [], "username": "yee"}}*/}
                        <View>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 'bold'
                                }}>
                                    {item.userID.username}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: 'grey',
                                }}>
                                    {item.timestamp}
                                </Text>
                            </View>
                            <Text>
                                {item.body}
                            </Text>
                            <View style={{flexDirection: 'row', gap: 10}}>
                                <TouchableOpacity style={{paddingTop: 5}} onPress={() => {
                                    handleReplyTo(item)
                                }}>
                                    <Text style={{marginTop: 5, fontSize: 12, fontFamily: 'OpenSansBold'}}>
                                        reply
                                    </Text>
                                </TouchableOpacity>
                                {item.userID._id === userID &&
                                    <TouchableOpacity style={{paddingTop: 5}} onPress={() => {
                                        setEditComment(!editComment)
                                        setEditTyped(item.body)
                                        setEditCommentID(item._id)
                                    }}>
                                        <Text style={{
                                            marginTop: 5,
                                            fontSize: 12,
                                            fontFamily: 'OpenSansBold',
                                            color: editComment && item._id === editCommentID ? '#0080FF' : 'black'
                                        }}>
                                            edit
                                        </Text>
                                    </TouchableOpacity>
                                }
                                {item.userID._id === userID &&
                                    <TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={() => {
                                        handleDeleteComment(item._id)
                                    }}>
                                        <Text style={{marginTop: 5, fontSize: 12, fontFamily: 'OpenSansBold'}}>
                                            delete
                                        </Text>
                                    </TouchableOpacity>
                                }
                            </View>

                            {item.replyBy !== undefined && item.replyBy.length > 0 &&
                                <View>
                                    <Text>_____________________________</Text>
                                    {/*<TouchableOpacity onPress={() => {*/}
                                    {/*    toggleReplies();*/}
                                    {/*}}>*/}
                                    {/*    <Text> more replies </Text>*/}
                                    {/*</TouchableOpacity>*/}
                                </View>
                            }
                        </View>
                    </View>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginRight: 15
                    }}>
                        <View style={{flexDirection: 'column', alignItems: 'center'}}>
                            {item.likes.includes(userID) ?
                                (<TouchableOpacity style={{paddingTop: 5}} onPress={handleUnlikeComment}>
                                    <Image source={HeartIcon} style={{width: 15, height: 15, tintColor: 'red'}}></Image>
                                </TouchableOpacity>)
                                :
                                (<TouchableOpacity style={{paddingTop: 5}} onPress={handleLikeComment}>
                                    <Image source={HeartIcon} style={{width: 15, height: 15}}></Image>
                                </TouchableOpacity>)}
                            <Text>{item.likes.length}</Text>
                        </View>
                    </View>
                </View>
                {/*{showReplies &&*/}
                <View>
                    <FlatList
                        data={replies}
                        renderItem={({item}) => <ReplyItem item={item} userID={userID}/>}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                {/*}*/}

            </View>
        );
    })

    const TypeComponent = ({onSubmitComment, onHandleEdit}) => {
        const [commentTyped, setCommentTyped] = useState(editComment ? editTyped : '');

        const handleInputChange = useCallback((inputText) => {
            setCommentTyped(inputText);
        }, []);

        const handleSubmitComment = () => {
            if (editComment) {
                onHandleEdit(commentTyped);
            } else {
                onSubmitComment(commentTyped);
            }
            // Optionally clear the input after submission
            setCommentTyped('');
        };


        return (
            <>
                <View style={{
                    display: "flex", flexDirection: "column", zIndex: 1
                }}>
                    {replyToID !== '' && replyToUserName !== '' &&
                        <View style={{
                            flexDirection: "row",
                            width: 329,
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            marginLeft: 17,
                            borderWidth: 1,
                            borderColor: '#252323',
                        }}>
                            <View style={{
                                flex: 1,
                            }}>
                                <Text style={{fontSize: 20}}>Reply to: {replyToUserName}</Text>
                            </View>
                            <TouchableOpacity style={{
                                padding: 4
                            }} onPress={handleCancelReply}>
                                <Image
                                    style={{
                                        width: 24,
                                        height: 24,
                                    }}
                                    source={require('../../assets/close.webp')}
                                />
                            </TouchableOpacity>
                        </View>
                    }
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        width: width,
                    }}>
                        <Input
                            placeholder={editComment ? 'Type to edit' : 'Type your comment here...'}
                            onChangeText={handleInputChange}
                            value={commentTyped}
                            style={{
                                height: 50,
                                width: '80%',
                                borderColor: 'gray',
                                paddingHorizontal: 10,
                                borderTopLeftRadius: replyToID !== '' && replyToUserName !== '' ? 0 : 8,
                                borderTopRightRadius: replyToID !== '' && replyToUserName !== '' ? 0 : 8,
                            }}
                        />
                        <TouchableOpacity onPress={handleSubmitComment}>
                            <Image source={sendMessage} style={{width: 50, height: 50}}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        );
    };


    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: height * 0.09,
            }}>
                <View style={{
                    paddingLeft: 15,
                    paddingBottom: 5,
                    alignItems: 'flex-start',
                    width: width * 0.2
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingRight: 80,
                    paddingBottom: 5
                }}>
                    <Text style={{fontSize: 32, fontFamily: 'OpenSansBold'}}>Comments</Text>
                </View>
            </View>
                <View style={{flex: 1}}>
                    {
                        commentsEnabled ? (
                            comments.length === 0 ? (
                                <View style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    {
                                        loading ? (
                                            <Text style={{
                                                color: 'grey',
                                                fontWeight: 'bold'
                                            }}>
                                                Loading comments...
                                            </Text>
                                        ) : (
                                            <Text style={{
                                                color: 'grey',
                                                fontWeight: 'bold'
                                            }}>
                                                No comments
                                            </Text>
                                        )
                                    }
                                </View>
                            ) : (
                                <FlatList
                                    data={comments}
                                    renderItem={({ item }) => <CommentItem item={item} userID={userID} />}
                                    keyExtractor={(comment) => comment._id.toString()}
                                />
                            )
                        ) : (
                            <View style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text style={{
                                    color: 'grey',
                                    fontWeight: 'bold'
                                }}>
                                    Comments Disabled
                                </Text>
                            </View>
                        )
                    }
                </View>
            <KeyboardAvoidingView
                style={{ }}
                behavior={"padding"}
            >
                {
                    commentsEnabled ?
                        <TypeComponent onSubmitComment={handleSubmitComment} onHandleEdit={handleEditComment} />
                    : <></>
                }
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Comment