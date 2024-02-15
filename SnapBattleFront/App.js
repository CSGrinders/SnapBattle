import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OpenSansRegular from './assets/fonts/OpenSansRegular.ttf';
import OpenSansBold from './assets/fonts/OpenSansExtraBold.ttf';
const Stack = createNativeStackNavigator()
import Testing from "./Pages/Testing"
import {ThemeProvider} from "@rneui/themed";
import {theme} from "./Theme/Theme.js"
import {useFonts} from "expo-font";


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
                    <Stack.Screen name="Testing" component={Testing}/>
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
}