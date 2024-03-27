import { View, Text, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackButton from '../../Components/Button/BackButton'
import { Switch } from '@rneui/themed'
import { Button } from '@rneui/themed'
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env;
import axios from 'axios'
import { WHEN_PASSCODE_SET_THIS_DEVICE_ONLY } from 'expo-secure-store'

const PostOptions = ({route, navigation}) => {
    const {height, width} = Dimensions.get('window')
    const {username, userID, groupID, token, postID} = route.params;
    const [updateCommentStatus, setUpdateCommentStatus] = useState(false)
    const [commentsAllowed, setCommentsAllowed] = useState(false)

    useEffect(() => {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/comments-allowed/${postID}`
        )
            .then((res) => {
                console.log(res.data.commentsAllowed)
                setCommentsAllowed(res.data.commentsAllowed)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])

    useEffect(() => {
        if (updateCommentStatus) {
            axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/toggle-comments/${postID}`, {
                postID: postID,
                userID: userID,
                commentsAllowed: commentsAllowed
            })
                .then((res) => {
                    console.log(res.data.commentsAllowed)
                })
                .catch((err) => {
                    console.log(err)
                })
                
            setUpdateCommentStatus(false)
        }
    }, [updateCommentStatus])

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
                        Post Options
                    </Text>
                </View>
                <View style={{
                    // something
                    width: width * 0.2
                }}>
                </View>
        </View>
        <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent:'center',
            gap: 30
        }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent:'center',
                gap: 20
            }}>
                <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold'
                }}>
                    Comments Allowed
                </Text>
                <Switch
                    value={commentsAllowed}
                    onValueChange={(value) => {
                        setCommentsAllowed(value)
                        setUpdateCommentStatus(true)
                    }}
                /> 
            </View>
            <View>
                <Button>
                    Edit Post
                </Button>
            </View>
            <View>
                <Button>
                    Delete Post
                </Button>
            </View>

        </View>
    </View>
        
        
  )
}

export default PostOptions