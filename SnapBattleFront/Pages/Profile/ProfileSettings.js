import {Text, View} from "react-native";
import BackButton from "../../Components/Button/BackButton";

function ProfileSettings({navigation}) {
    const backPressed = () => {
        console.log("navigate to previous screen");
        navigation.navigate('Profile')
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Profile Settings Screen</Text>
            <BackButton size={50} backPressed={backPressed}/>
        </View>
    )
}

export default ProfileSettings