import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator()

import CreateNewGroup from "./Pages/CreateNewGroup";
import Friends from "./Pages/Friends";
import GroupHome from "./Pages/GroupHome";
import GroupMembers from "./Pages/GroupMembers";
import GroupSettings from "./Pages/GroupSettings";
import Main from "./Pages/Main";
import Profile from "./Pages/Profile";
import ProfileSettings from "./Pages/ProfileSettings";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";

export default function App() {
  return (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="SignIn" component={SignIn} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}