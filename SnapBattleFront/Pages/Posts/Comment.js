import {
    View,
    Text,
    SafeAreaView,
    Dimensions,
    Image,
    FlatList,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity, Keyboard
} from 'react-native'
import React, { useState, useEffect } from 'react'
import BackButton from '../../Components/Button/BackButton';
import Logo from "../../assets/logo.webp";
import axios from 'axios';
import { Input } from '@rneui/themed';
import { Button } from '@rneui/base';
import GroupSettingsSubmitIcon from '../../Components/Group/SubmitSettingsIcon';
import ProfilePicture from '../../Components/Profile/ProfilePicture';
import SendIcon from "../../assets/send-icon.webp";
import HeartIcon from "../../assets/heart.webp";
import OtherProfilePicture from "../../Components/Profile/OtherProfilePicture";
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
    const [submitVisible, setSubmitVisible] = useState(false);
    const [replyToID, setReplyToID] = useState('');
    const [replyToUserName, setReplyToUserName] = useState('');

    useEffect(() => {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/view-comments/${postID}`
        )
            .then((res) => {
                setComments(res.data.comments)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [commentToggle])

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
    }, [commentToggle])

    const handleLikeComment = async () => {
        console.log("like");
    }

    const handleDeleteComment = (commentID) => {
        console.log("delete");
        axios.delete(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/delete-comment/${postID}/${commentID}`,
        )
            .then((res) => {
                console.log("after delete: ", res.data);
                setCommentToggle(!commentToggle)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const handleReplyTo = async (item) => {
        console.log("reply", item);
        await setReplyToID(item._id);
        await setReplyToUserName(item.userID.username);

        console.log("replyTo: ", item._id, item.userID.username);
    }

    const handleCancelReply = () => {
        setReplyToID('');
        setReplyToUserName('');
    }

    const handleSubmitComment = async () => {
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/create-comment/${postID}`,
            {
                commentBody: commentTyped,
                replyTo: null // TODO
            }
        )
            .then((res) => {
                console.log("after submit: ", res.data);
                setCommentToggle(!commentToggle)
                setCommentTyped('');
                setSubmitVisible(false);
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const renderCommentItem = ({item}) => (
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
                        <TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={() => {handleReplyTo(item)}}>
                            <Text style={{marginTop: 5, fontSize: 12, fontFamily: 'OpenSansBold'}}>
                                reply
                            </Text>
                        </TouchableOpacity>
                        {item.userID._id === userID &&
                            <TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={() => {handleDeleteComment(item._id)}}>
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
                    <TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={handleLikeComment}>
                        <Image source={HeartIcon} style={{width: 15, height: 15}}></Image>
                    </TouchableOpacity>
                    <Text>0</Text>
                </View>
            </View>
        </View>
    );
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
            borderWidth: 3,
            marginBottom: 5,
            backgroundColor: "#cccccc"
        }}>
        {
            commentsEnabled 
            ?         
            (comments.length === 0 ?
                <View style={{
                    // flex: 1,
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
                renderItem = {renderCommentItem}
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
                          <Input
                              placeholder='Type to comment'
                              onChangeText={newComment => {
                                  if (newComment === '') {
                                      setSubmitVisible(false);
                                  } else {
                                      setSubmitVisible(true);
                                  }
                                  setCommentTyped(newComment)
                              }}
                              value={commentTyped}
                          />
                      </View>
                      {submitVisible &&
                          <TouchableOpacity style={{marginLeft: 3, paddingTop: 5}} onPress={handleSubmitComment}>
                              <Image source={SendIcon} style={{width: 50, height: 50}}></Image>
                          </TouchableOpacity>
                      }
                  </View>
              </View>
          </KeyboardAvoidingView>
    </View>
  )
}

export default Comment