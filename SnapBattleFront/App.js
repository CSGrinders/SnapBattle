import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OpenSansRegular from './assets/fonts/OpenSansRegular.ttf';
import OpenSansBold from './assets/fonts/OpenSansSemiBold.ttf';

const Stack = createNativeStackNavigator()
import {ThemeProvider} from "@rneui/themed";
import {theme} from "./Theme/Theme.js"
import {useFonts} from "expo-font";
import SignUp from "./Pages/Auth/SignUp";
import SignIn from "./Pages/Auth/SignIn";
import Profile from "./Pages/Profile/Profile";
import GroupSettings from "./Pages/Group/GroupSettings";
import createNewGroup from "./Pages/Group/CreateNewGroup";
import GroupMembers from "./Pages/Group/GroupMembers";
import ProfileSettings from "./Pages/Profile/ProfileSettings";
import Friends from "./Pages/Friends/Friends";
import Groups from "./Pages/Group/Groups";
import GroupHome from "./Pages/Group/GroupHome";
import OtherProfile from "./Pages/Friends/OtherProfile";
import {SocketProvider} from "./Storage/Socket";
import SubmissionCamera from "./Pages/Group/SubmissionCamera";
import GroupChat from "./Pages/Group/GroupChat";
import Comment from './Pages/Posts/Comment';
import PostOptions from './Pages/Posts/PostOptions';


function App() {

    const [fontsLoaded, fontError] = useFonts({ //Load fonts
        'OpenSansRegular': OpenSansRegular,
        'OpenSansBold': OpenSansBold,
    });

    if (!fontsLoaded && !fontError) {
        return null;
    }

    //Don't touch unless you want add a page
    return (
        <ThemeProvider theme={theme}>
            <NavigationContainer>
                <SocketProvider>
                    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="SignIn">
                        <Stack.Screen name="SignIn" options={{gestureEnabled: false}} component={SignIn}/>
                        <Stack.Screen name="SignUp" options={{gestureEnabled: false}} component={SignUp}/>
                        <Stack.Screen name="Profile" component={Profile}/>
                        <Stack.Screen name="ProfileSettings" component={ProfileSettings}/>
                        <Stack.Screen name="GroupSettings" component={GroupSettings}/>
                        <Stack.Screen name="CreateGroup" component={createNewGroup}/>
                        <Stack.Screen name="GroupMembers" component={GroupMembers}/>
                        <Stack.Screen name="Friends" component={Friends}/>
                        <Stack.Screen name="Main" options={{gestureEnabled: false}} component={Groups}/>
                        <Stack.Screen name="GroupHome" options={{gestureEnabled: false}} component={GroupHome}/>
                        <Stack.Screen name="OtherProfile" component={OtherProfile}/>
                        <Stack.Screen name="Camera" component={SubmissionCamera}/>
                        <Stack.Screen name="GroupChat" component={GroupChat}/>
                        <Stack.Screen name="Prompts" component={GroupChat}/>
                        <Stack.Screen name="Comments" component={Comment}/>
                        <Stack.Screen name="PostOptions" component={PostOptions}/>
                    </Stack.Navigator>
                </SocketProvider>
            </NavigationContainer>
        </ThemeProvider>
    );
}

export default App;