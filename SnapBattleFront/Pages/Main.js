import {Text, View} from "react-native";
import {useEffect, useState} from "react";
import {getUserInfo} from "../Storage/Storage";
import {Button} from "@rneui/themed";

function Main({navigation}) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [userID, setUserID] = useState('');
    const [token, setToken] = useState('');

    //Example on how to pull data from the storage
    useEffect(() => {
        getUserInfo(process.env.EXPO_PUBLIC_USER_INFO).then((info) => {
            if (info) {
                const userData = JSON.parse(info);
                if (userData.name) setName(userData.name);
                if (userData.username) setUsername(userData.username);
                if (userData.email) setEmail(userData.email);
                if (userData.id) setUserID(userData.id)
                if (userData.username) setUsername(userData.username)
            }
        });
        getUserInfo(process.env.EXPO_PUBLIC_USER_TOKEN).then((info) => {
            if (info) {
                setToken(info);
            }
        });
    }, []);


    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Test your components on this screen :)</Text>
            <Button onPress={() => navigation.navigate('Profile')}>Profile</Button>
            <Button onPress={() => navigation.navigate('GroupSettings')}>GroupSettings</Button>
            <Button onPress={() => navigation.navigate('CreateGroup')}>CreateGroup</Button>
            <Button onPress={() => navigation.navigate('GroupMembers')}>GroupMembers</Button>
            <Button onPress={() => navigation.navigate('ProfileSettings')}>ProfileSettings</Button>
            <Button onPress={() => navigation.navigate('Friends')}>Friends</Button>
            <View style={{ paddingTop: 20 }}>
                <Text>Name: {name}</Text>
                <Text>Email: {email}</Text>
                <Text>Username: {username}</Text>
                <Text>Userid: {userID}</Text>
                <Text>Token: {token}</Text>
            </View>
        </View>
    )
}

export default Main