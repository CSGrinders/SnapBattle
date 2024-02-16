import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OpenSansRegular from './assets/fonts/OpenSansRegular.ttf';
import OpenSansBold from './assets/fonts/OpenSansExtraBold.ttf';
const Stack = createNativeStackNavigator()
import Testing from "./Pages/Testing"
import {ThemeProvider} from "@rneui/themed";
import {theme} from "./Theme/Theme.js"
import {useFonts} from "expo-font";
import SignUp from "./Pages/Auth/SignUp";
import SignIn from "./Pages/Auth/SignIn";
import GroupSettings from "./Pages/Group/GroupSettings";


export default function App() {

    const [fontsLoaded, fontError] = useFonts({ //Load fonts
        'OpenSansRegular': OpenSansRegular,
        'OpenSansBold': OpenSansBold,
    });

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <ThemeProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="Testing" component={GroupSettings}/>
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
}