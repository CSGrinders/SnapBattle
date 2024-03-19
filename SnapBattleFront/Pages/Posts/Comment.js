import { View, Text, SafeAreaView, Dimensions, Image, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import BackButton from '../../Components/Button/BackButton';
import Logo from "../../assets/logo.webp";
import axios from 'axios';
import { Input } from '@rneui/themed';
import { Button } from '@rneui/base';
import GroupSettingsSubmitIcon from '../../Components/Group/SubmitSettingsIcon';
import ProfilePicture from '../../Components/Profile/ProfilePicture';
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

    useEffect(() => {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/view-comments/${postID}`
        )
            .then((res) => {
                console.log("comments:",res.data.comments)
                // setComments(res.data.comments)
                setComments([
                    {
                        _id: 1,
                        timestamp: "12:30",
                    userID: {
                        username: "bruh"
                    },
                    body: "hello"
                    },
                    {
                        _id: 2,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 3,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 4,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 5,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 6,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 7,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 8,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 9,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 10,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 11,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    },
                    {
                        _id: 12,
                        timestamp: "12:30",
                        userID: {
                            username: "bruh"
                        },
                        body: "hello"
                    }
                ])
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

    const renderCommentItem = ({item}) => (
        <View style={{    
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 30
            }}>
            <ProfilePicture size={35} userID={item.userID}/>
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
            </View>
        </View>
    );
  return (
    <View style={{flex: 1}}>
        <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: height * 0.15,
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{width: width * 0.7, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 20, fontFamily: 'OpenSansBold'}}>
                        Comments
                    </Text>
                </View>
        </View>
        <View style={{
            overflow: 'scroll',
            height: height * .70
        }}>
        {
            commentsEnabled 
            ?         
            (comments.length === 0 ?
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
                        No comments
                    </Text>
                </View>
            :
            <FlatList
                data = {comments}
                renderItem = {renderCommentItem}
                keyExtractor = {(comment) => comment._id.toString()}
                style={{flex: 1}}
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
        <View style={{
            flex: 1
        }}>
            <View style={{
                flexDirection: 'row'
            }}>
                <Input
                    placeholder='Type to comment'
                />
                <GroupSettingsSubmitIcon size={50}/>
            </View>
        </View>


    </View>
  )
}

export default Comment