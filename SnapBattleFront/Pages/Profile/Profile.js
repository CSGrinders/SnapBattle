import {Dimensions, SafeAreaView, View} from "react-native";
import {Button, Text} from "@rneui/themed";
import ProfilePicture from "../../Components/Profile/ProfilePicture";

function Profile({navigation}) {
    let {width, height} = Dimensions.get('window') //Get dimensions of the screen for footer

    return (
        <SafeAreaView style={{
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: width,
            height: height - 50}}>
            <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: height * 0.3
            }}>
                <ProfilePicture size={150}/>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Name</Text>
                <Text>@username</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                height: height * 0.1}}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    marginBottom: 5
                }}>Bio</Text>
                <Text>Hello World!</Text>
            </View>

            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: width * 0.8,
                height: height * 0.1}}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    marginBottom: 5
                }}>Achievements</Text>
                <Text>Winner x2</Text>
            </View>

            <View style={{height: height * 0.35, justifyContent: 'flex-end'}}>
                <Button style={{
                    alignContent: 'flex-end',
                    alignItems: 'center',
                    justifyContent: 'center'}}>
                    Friends
                </Button>
            </View>
        </SafeAreaView>
    )
}

export default Profile