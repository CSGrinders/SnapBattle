import { View } from 'react-native';
import { TamaguiProvider } from 'tamagui'
export default function App() {
  return (
      <TamaguiProvider>
        <View>
          Hello
        </View>
      </TamaguiProvider>
  );
}