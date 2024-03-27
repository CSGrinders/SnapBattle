import {
    View,
    Text,
    SafeAreaView,
    Dimensions,
    Image,
    FlatList,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity, Keyboard, TextInput
} from 'react-native'
import React, {useState, useEffect, useCallback, useRef} from 'react'
import BackButton from '../../Components/Button/BackButton';
import Logo from "../../assets/logo.webp";
import axios from 'axios';
import { Input } from '@rneui/themed';
import { Button } from '@rneui/base';
import GroupSettingsSubmitIcon from '../../Components/Group/SubmitSettingsIcon';
import ProfilePicture from '../../Components/Profile/ProfilePicture';
import SendIcon from "../../assets/send.webp";
import HeartIcon from "../../assets/heart.webp";
import OtherProfilePicture from "../../Components/Profile/OtherProfilePicture";
import CommentItem from "../../Components/DailyPrompt/CommentItem";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env;

const Comment = ({size, route, navigation}) => {
    const {width, height} = Dimensions.get('window');
    const {username, userID, groupID, token, postID} = route.params;

    useEffect(() => {
        console.log('Username:', username);
        console.log('UserID:', userID);
        console.log('GroupID:', groupID);
        console.log('Token:', token);
      }, [username, userID, groupID, token]);

    const [comments, setComments] = useState([])
    const [commentsEnabled, setCommentsEnabled] = useState(false)
    const [commentTyped, setCommentTyped] = useState('');
    const [commentToggle, setCommentToggle] = useState(false);
    const [replyToID, setReplyToID] = useState('');
    const [replyToUserName, setReplyToUserName] = useState('');
    const [editComment, setEditComment] = useState(false)
    const [editTyped, setEditTyped] = useState('');
    const [editCommentID, setEditCommentID] = useState();

    useEffect(() => {
        console.log("RUNNnNNNN@@@@@@@@@@@@@@")
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/view-comments/${postID}`
        )
            .then((res) => {
                console.log(res.data.comments)
                setComments(res.data.comments)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])

    useEffect(() => {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/comments-allowed/${postID}`
        )
            .then((res) => {
                console.log("comments enabled:",res.data.commentsAllowed)
                setCommentsEnabled(res.data.commentsAllowed)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])

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

    const handleReplyTo = async (item) => {
        console.log("reply", item);
        setReplyToID(item._id);
        setReplyToUserName(item.userID.username);
        setEditComment(false);

        console.log("replyTo: ", item._id, item.userID.username);
    }

    const handleCancelReply = () => {
        setReplyToID('');
        setReplyToUserName('');
    }

    const handleEditComment = async() => {
        if (editTyped !== '') {
            console.log(editTyped)
            axios.post(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/edit-comment/${postID}`, {
                    userID: userID,
                    commentID: editCommentID,
                    content: editTyped
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
                console.log(res.data.comments);
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
        console.log("reply Item", item, userID);

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
                    marginLeft: 30,
                    backgroundColor: "#cccccc",
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
                                    <Image source={HeartIcon} style={{width: 15, height: 15, tintColor: 'red' }}></Image>
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

    const CommentItem = ({item, userID}) => {
        console.log("commentItem likes: ", item);
        const [showReplies, setShowReplies] = useState(false);
        const [replies, setReplies] = useState([]);

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


        useEffect(() => {
            if (item.replyBy !== null && item.replyBy.length > 0) {
                setReplies(item.replyBy);
                console.log("plse", item.replyBy);
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
                                    <TouchableOpacity onPress={() => {
                                        toggleReplies();
                                    }}>
                                        <Text> more replies </Text>
                                    </TouchableOpacity>
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
                                <Image source={HeartIcon} style={{width: 15, height: 15, tintColor: 'red' }}></Image>
                            </TouchableOpacity>)
                            :
                            (<TouchableOpacity style={{paddingTop: 5}} onPress={handleLikeComment}>
                                <Image source={HeartIcon} style={{width: 15, height: 15}}></Image>
                            </TouchableOpacity>)}
                            <Text>{item.likes.length}</Text>
                        </View>
                    </View>
                </View>
                {showReplies &&
                    <View>
                        <FlatList
                            data = {replies}
                            renderItem = {({ item }) => <ReplyItem item={item} userID={userID}/>}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                }

            </View>
    )
    };

    const TypeComponent = ({ onSubmitComment }) => {
        const [commentTyped, setCommentTyped] = useState('');

        const handleInputChange = useCallback((inputText) => {
            setCommentTyped(inputText);
        }, []);

        const handleSubmitComment = () => {
            onSubmitComment(commentTyped);
            // Optionally clear the input after submission
            setCommentTyped('');
        };

        return (
            <>
                <TextInput
                    value={commentTyped}
                    onChangeText={handleInputChange}
                    placeholder="Type your comment here..."
                    style={{
                        height: 50,
                        width: '80%',
                        borderWidth: 1,
                        borderColor: 'gray',
                        paddingHorizontal: 10,
                    }}
                />
                <TouchableOpacity onPress={handleSubmitComment} style={{ marginLeft: 15, paddingTop: 5 }}>
                    <Image source={SendIcon} style={{ width: 40, height: 40 }} />
                </TouchableOpacity>
            </>
        );
    };

  return (
      <View style={{
          display: "flex",
          flex: 1
      }}>
        <View style={{
                display: "flex",
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                // height: height * 0.15,
                flex: 0.15,
                marginTop: 20
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start',
                    width: width * 0.2
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{width: width * 0.6, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 30, fontFamily: 'OpenSansBold'}}>
                        Comments
                    </Text>
                </View>
                <View style={{
                    // something
                    width: width * 0.2
                }}>
                </View>
        </View>
        <View style={{
            display: "flex",
            overflow: 'scroll',
            flex: 0.7,
            marginBottom: 5,
        }}>
        {
            commentsEnabled
            ?
            (comments.length === 0 ?
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{
                        color: 'grey',
                        fontWeight: 'bold'
                    }}>
                        No comments
                    </Text>
                </View>
            :
            <FlatList
                data = {comments}
                renderItem = {({ item }) => <CommentItem item={item} userID={userID}/>}
                keyExtractor = {(comment) => comment._id.toString()}
                // style={{flex: 1}}
            />
            )
            :
            <View style={{
                flex: 1,
                marginBottom: 200,
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
        }
        </View>
          <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              style={replyToID !== '' && replyToUserName !== '' ? {display: "flex", flex: 0.2} : {display: "flex", flex: 0.1}}
          >
              <View style={{
                  display: "flex",
                  flex: 1,
              }}>
                  <View style={{
                      display: "flex",
                      flex: 1,
                      flexDirection: "row"
                  }}>
                      <View style={{
                          display: "flex", flexDirection: "column"
                      }}>
                          {replyToID !== '' && replyToUserName !== '' &&
                              <View style={{
                                  display: "flex-inline",
                                  flexDirection: "row",
                                  alignItems: "center"
                              }}>
                                  <View style={{
                                      marginLeft: 10,
                                      flex: 1,
                                      borderWidth: 1,
                                      borderRadius: 5
                                  }}>
                                      <Text>reply to: {replyToUserName}</Text>
                                      <Text> </Text>
                                  </View>
                                  <TouchableOpacity style={{marginLeft: 5, paddingTop: 5}} onPress={handleCancelReply}>
                                      <Text style={{fontSize: 40}}> x </Text>
                                  </TouchableOpacity>
                              </View>
                          }
                            {
                                editComment ?
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    width: width * .95,
                                }}>
                                    <Input
                                        placeholder='Type to edit'
                                        onChangeText={newComment => {
                                        setEditTyped(newComment)
                                        }}
                                        value={editTyped}
                                        inputContainerStyle={{
                                            width: width * .8
                                        }}
                                        inputStyle={{
                                            height: 50,
                                        }}
                                    />
                                    <TouchableOpacity style={{ paddingTop: 5,}} onPress={handleEditComment}>
                                        <Image source={SendIcon} style={{width: 40, height: 40}}></Image>
                                    </TouchableOpacity>
                                </View>
                                :
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    width: width * .95,
                                }}>
                                    <TypeComponent onSubmitComment={handleSubmitComment}></TypeComponent>
                                </View>
                            }
                      </View>
                  </View>
              </View>
          </KeyboardAvoidingView>
    </View>
  )
}

export default Comment