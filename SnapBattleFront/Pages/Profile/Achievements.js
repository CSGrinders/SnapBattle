import { View, Text, Dimensions, KeyboardAvoidingView, FlatList } from 'react-native'
import React from 'react'
import BackButton from '../../Components/Button/BackButton'
import { Image } from 'expo-image'
import MedalIcon from "../../assets/medal.webp"


function Achievements({route, navigation}) {
    const {width, height} = Dimensions.get('window')
    const displayedAchievements = [{name: "1"}, {name: "2"}, {name: "3"}, {name: "4"}, {name: "2"}, {name: "3"}, {name: "4"}]

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
        </View>
  )
}

export default Achievements