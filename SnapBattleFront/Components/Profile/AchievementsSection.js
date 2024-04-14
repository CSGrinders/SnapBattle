import { View, Text, Dimensions, FlatList } from 'react-native'
import React from 'react'
import MedalIcon from "../../assets/medal.webp"
import { Image } from 'expo-image'

const AchievementsSection = () => {
    const displayedAchievements = [{name: "1"}, {name: "2"}, {name: "3"}, {name: "4"}, {name: "2"}, {name: "3"}, {name: "4"}]
    const {width, height} = Dimensions.get('window');

    const renderItem = ({item}) => (
        <View style={{
            width: 80,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            margin: 5
        }}>
            <Image source={MedalIcon} style={{
                width: 50,
                height: 50
            }}/>
            <Text style={{
                textAlign: 'center'
            }}>Winner of 3/19/24</Text>
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        height: 200,
        justifyContent: 'center'
    }}>
        <View style={{
            alignItems: 'center'
        }}>
            <FlatList
            data={displayedAchievements}
            renderItem={renderItem}
            keyExtractor={(item) => item.name}
            numColumns={4}
            contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingHorizontal: 10,
            }}
        />
        </View>
    </View>
    </View>
  )
}

export default AchievementsSection