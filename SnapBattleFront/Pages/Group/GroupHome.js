import {View, Text,SafeAreaView, KeyboardAvoidingView, Platform, Dimensions, Pressable, TouchableOpacity} from "react-native";
import {Button} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import Logo from "../../assets/logo.webp";
import Chat from "../../assets/chat.webp";
import Camera from "../../assets/camera.webp";
import Group from "../../assets/group.webp";
import {Image} from "expo-image";
import LeaderBoard from '../../assets/Leaderboard.webp';
import DailyPrompt from "../../Components/DailyPrompt/DailyPrompt";
import PostComponent from "../../Components/DailyPrompt/PostComponent";
import React from "react";

function GroupHome({route, navigation}) {
    const {username, userID, groupID, token} = route.params
    const {width, height} = Dimensions.get('window');

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
                    width: width * 0.15
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{width: width * 0.7, justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={{
                        width: 120,
                        height: 120,
                        top: 15,
                    }} source={Logo}></Image>
                </View>
                <View style={{
                    width: width * 0.15,
                    height: height * 0.1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Image
                        style={{width: '100%', height: '100%'}}
                        source={LeaderBoard}
                        contentFit="contain"
                    />
                </View>
            </View>
            <View style={{
                width: width,
                height: height * 0.18,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <DailyPrompt/>
            </View>
            <View style={{
                width: width,
                alignItems: 'center',
                height: height * 0.55
            }}>
                <PostComponent/>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: height * 0.1
            }}>
                <View style={{
                    width: width * 0.3,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <TouchableOpacity style={{width: '100%', height: '100%'}} onPress={() => navigation.navigate('GroupChat', route.params)}>
                        <Image
                            style={{width: '80%', height: '80%'}}
                            source={Chat}
                            contentFit="contain"
                        />
                    </TouchableOpacity>
                </View>
                <View style={{
                    width: width * 0.3,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <TouchableOpacity style={{width: '100%', height: '100%'}} onPress={() => navigation.navigate('Camera', route.params)}>
                        <Image
                            style={{width: '80%', height: '80%'}}
                            source={Camera}
                            contentFit="contain"
                        />
                    </TouchableOpacity>
                </View>
                <View style={{
                    width: width * 0.3,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <TouchableOpacity style={{width: '100%', height: '100%'}} onPress={() => navigation.navigate('GroupMembers', route.params)}>
                        <Image
                        style={{width: '80%', height: '80%'}}
                        source={Group}
                        contentFit="contain"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default GroupHome;


{/*</View>*/}
{/*<KeyboardAvoidingView*/}
{/*behavior={Platform.OS === "ios" ? "padding" : "height"}*/}
{/*enabled={false} style={{flex: 1, alignItems: "center"}}>*/}
{/*    <View style={{*/}
{/*        flexDirection: 'row',*/}
{/*        alignItems: 'center',*/}
{/*        justifyContent: 'flex-start',*/}
{/*        marginTop: 70,*/}
{/*        marginBottom: 10*/}
{/*    }}>*/}
{/*        <View style={{*/}
{/*            paddingLeft: 15,*/}
{/*            alignItems: 'flex-start'*/}
{/*        }}>*/}
{/*            <BackButton size={50} navigation={navigation}/>*/}
{/*        </View>*/}
{/*        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 20}}>*/}
{/*            <Text style={{fontSize: 32, fontFamily: 'OpenSansBold'}}>Group Home</Text>*/}
{/*        </View>*/}
{/*    </View>*/}
{/*    <View style={{*/}
{/*        width: width,*/}
{/*        height: height - 300,*/}
{/*        justifyContent: "center",*/}
{/*        alignItems: "center",*/}
{/*    }}>*/}
{/*        <Button*/}
{/*            onPress={() => navigation.navigate("GroupMembers", route.params)}*/}
{/*        >*/}
{/*            Group Members*/}
{/*        </Button>*/}
{/*        <Button onPress={() => navigation.navigate('GroupSettings', route.params)}>*/}
{/*            GroupSettings*/}
{/*        </Button>*/}
{/*        <Button onPress={() => navigation.navigate('Camera')}>*/}
{/*            Camera Button*/}
{/*        </Button>*/}
{/*        <Button onPress={() => navigation.navigate('GroupChat', route.params)}>*/}
{/*            Group Chat*/}
{/*        </Button>*/}
{/*        <Button onPress={() => navigation.navigate('', route.params)}>*/}
{/*            Posts Temp*/}
{/*        </Button>*/}
{/*    </View>*/}
{/*</KeyboardAvoidingView>*/}