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
                <Stack.Navigator screenOptions={{headerShown: false, animation: 'none'}} initialRouteName="SignIn" >
                    <Stack.Screen name="SignIn" component={SignIn}/>
                    <Stack.Screen name="SignUp" component={SignUp}/>
                    <Stack.Screen name="Profile" component={Profile}/>
                    <Stack.Screen name="ProfileSettings" component={ProfileSettings}/>
                    <Stack.Screen name="GroupSettings" component={GroupSettings}/>
                    <Stack.Screen name="CreateGroup" component={createNewGroup}/>
                    <Stack.Screen name="GroupMembers" component={GroupMembers}/>
                    <Stack.Screen name="Friends" component={Friends}/>
                    <Stack.Screen name="Groups" component={Groups} />
                    <Stack.Screen name="GroupHome" component={GroupHome} />
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
}

export default App;