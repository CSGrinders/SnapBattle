import {View, Text, Dimensions, FlatList} from 'react-native'
import React, {useCallback, useEffect, useState} from 'react'
import MedalIcon from "../../assets/medal.webp"
import TrophyIcon from "../../assets/trophy.webp"
import SuccessIcon from "../../assets/success.webp"
import FireIcon from "../../assets/fire.webp"

import {Image} from 'expo-image'
import {useFocusEffect} from '@react-navigation/native'

const AchievementsSection = ({achievements}) => {
    const [preview, setPreview] = useState([])
    const {width, height} = Dimensions.get('window');

    useFocusEffect(
        useCallback(() => {
            if (Array.isArray(achievements)) {
                setPreview(achievements.splice(achievements.length - 4).reverse())
            }
        }, [achievements])
    )

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
        <View style={{
            width: width,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <View style={{
                marginVertical: 15,
                backgroundColor: '#f5f5f5',
                borderRadius: 10,
                paddingVertical: 10,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                height: 125,
                justifyContent: 'center'
            }}>
                <View style={{
                    alignItems: 'center'
                }}>
                    {preview.length === 0 ?
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 10,
                            width: width * .88

                        }}>
                        <Text style={{
                            color: 'grey',
                            fontWeight: 'bold',
                            fontSize: 25,
                        }}>No Achievements</Text>
                        </View>
                        :
                        <FlatList
                            data={preview}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.name}
                            numColumns={4}
                            contentContainerStyle={{
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                paddingHorizontal: 10,
                                width: width * .88
                            }}
                        />
                    }
                </View>
            </View>
        </View>
    )
}

export default AchievementsSection