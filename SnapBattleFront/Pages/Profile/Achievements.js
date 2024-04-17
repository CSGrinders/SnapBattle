import { View, Text, Dimensions, KeyboardAvoidingView, FlatList } from 'react-native'
import React, { useCallback, useState } from 'react'
import BackButton from '../../Components/Button/BackButton'
import { Image } from 'expo-image'
import MedalIcon from "../../assets/medal.webp"
import TrophyIcon from "../../assets/trophy.webp"
import SuccessIcon from "../../assets/success.webp"
import FireIcon from "../../assets/fire.webp"
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'

const {EXPO_PUBLIC_API_URL} = process.env;



function Achievements({route, navigation}) {
    const {width, height} = Dimensions.get('window')
    const [displayedAchievements, setDisplayedAchievements] = useState([])
    const {userID, searchID} = route.params; // actually route/params does not pass username and name from group page

    useFocusEffect(
        useCallback(() => {
            getAchievements();
        }, [])
    );

    function getAchievements() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/get-achievements/${searchID}`
        )
            .then((res) => {
                setDisplayedAchievements(res.data.achievements.reverse())
            })
            .catch((err) => {
                console.log("Error:", err)
            })
    }
    

    const renderItem = ({item}) => (
        <View style={{
            width: 80,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            margin: 5
        }}>
{
                item.type === 'medal' 
                ? 
                <Image source={MedalIcon} style={{
                    width: 50,
                    height: 50
                }}/>
                :
                item.type === 'trophy'
                ?
                <Image source={TrophyIcon} style={{
                    width: 50,
                    height: 50
                }}/>
                :
                item.type === 'success'
                ?
                <Image source={SuccessIcon} style={{
                    width: 50,
                    height: 50
                }}/>
                :
                <Image source={FireIcon} style={{
                    width: 50,
                    height: 50
                }}/>
            }
            <Text style={{
                textAlign: 'center'
            }}>{item.name}</Text>
        </View>
    )

  return (
<View style={{flex: 1, alignItems: "center"}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginTop: 70,
                marginBottom: 10
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 55}}>
                    <Text style={{fontSize: 30, fontFamily: 'OpenSansBold'}}>Achievements</Text>
                </View>
            </View>
    {displayedAchievements.length === 0 ?
        <>
            <View style={{
                flex: 0.8,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{
                    color: 'grey',
                    fontWeight: 'bold',
                    fontSize: 25,
                }}>No Achievements</Text>
            </View>
        </> :
            <FlatList
            data={displayedAchievements}
            renderItem={renderItem}
            keyExtractor={(item) => item.name}
            numColumns={4}
            contentContainerStyle={{
                marginTop:20,
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingHorizontal: 10,
            }}
        />
    }
        </View>
  )
}

export default Achievements