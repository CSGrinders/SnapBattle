import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator()

import Testing from "./Pages/Testing"
import {ThemeProvider} from "@rneui/themed";
import {theme} from "./Theme/Theme.js"
import Profile from "./Pages/Profile/Profile";


export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="Profile" component={Profile}/>
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
}