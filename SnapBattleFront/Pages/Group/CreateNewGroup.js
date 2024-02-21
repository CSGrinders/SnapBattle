import { Button, Input } from "@rneui/themed";
import { useCallback, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import BackIcon from "../../assets/back-icon.webp";
import DropDownPicker from "react-native-dropdown-picker";
import { Image } from "expo-image";
import axios from "axios";
import ErrorPrompt from "../../Components/ErrorPrompt";
import {getUserInfo} from "../../Storage/Storage";

const { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN, EXPO_PUBLIC_USER_INFO } =
  process.env;

function CreateNewGroup({ route, navigation }) {
  const {userID} = route.params
  const { width, height } = Dimensions.get("window");

  // input fields
  const [groupName, setGroupName] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [promptTime, setPromptTime] = useState("");
  const [submissionTime, setSubmissionTime] = useState("");

  // state variables for dropdown
  const [promptOpen, setPromptOpen] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);

  const [items, setItems] = useState([
    { label: "12:00AM", value: "00:00" },
    { label: "01:00AM", value: "01:00" },
    { label: "02:00AM", value: "02:00" },
    { label: "03:00AM", value: "03:00" },
    { label: "04:00AM", value: "04:00" },
    { label: "05:00AM", value: "05:00" },
    { label: "06:00AM", value: "06:00" },
    { label: "07:00AM", value: "07:00" },
    { label: "08:00AM", value: "08:00" },
    { label: "09:00AM", value: "09:00" },
    { label: "10:00AM", value: "10:00" },
    { label: "11:00AM", value: "11:00" },
    { label: "12:00PM", value: "12:00" },
    { label: "01:00PM", value: "13:00" },
    { label: "02:00PM", value: "14:00" },
    { label: "03:00PM", value: "15:00" },
    { label: "04:00PM", value: "16:00" },
    { label: "05:00PM", value: "17:00" },
    { label: "06:00PM", value: "18:00" },
    { label: "07:00PM", value: "19:00" },
    { label: "08:00PM", value: "20:00" },
    { label: "09:00PM", value: "21:00" },
    { label: "10:00PM", value: "22:00" },
    { label: "11:00PM", value: "23:00" },
  ]);

  const onPromptOpen = useCallback(() => {
    setSubmissionOpen(false);
  }, []);

  const onSubmissionOpen = useCallback(() => {
    setPromptOpen(false);
  }, []);

  // input field error messages
  const [errorMessageGroupName, setErrorMessageGroupName] = useState("");
  const [errorMessageGroupSize, setErrorMessageGroupSize] = useState("");
  const [errorMessagePromptTime, setErrorMessagePromptTime] = useState("");
  const [errorMessageSubmissionTime, setErrorMessageSubmissionTime] =
    useState("");

  // server error messages
  const [errorMessageServer, setErrorMessageServer] = useState("");
  const [errorServer, setErrorServer] = useState(false);

  const handleGroupCreate = () => {
    setErrorMessageGroupName("");
    setErrorMessageGroupSize("");
    setErrorMessagePromptTime("");
    setErrorMessageSubmissionTime("");
    setErrorServer(false);

    let error = false;
    if (!groupName) {
      setErrorMessageGroupName("Field empty.");
      error = true;
    }
    if (!groupSize) {
      setErrorMessageGroupSize("Field empty");
      error = true;
    } else if (isNaN(parseInt(groupSize))) {
      setErrorMessageGroupSize("Field contains non-numeric characters");
      error = true;
    }

    if (!promptTime) {
      setErrorMessagePromptTime("Field empty.");
      error = true;
    }

    if (!submissionTime) {
      setErrorMessageSubmissionTime("Field empty.");
      error = true;
    }

    if (!error) {
                    axios.post(
                        `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/create`,
                        {
                            userID: userID,
                            groupName: groupName,
                            maxUsers: groupSize,
                            timeStart: promptTime,
                            timeEnd: submissionTime,
                            timeToVote: submissionTime
                        }
                    ).then((response) => {
                        navigation.navigate("Groups", {userID: userID})

                    }).catch((error) => {
                        console.log(error)
                    })
                }
    }

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={false}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            height: height * 0.2,
            width: width * 0.9,
          }}
        >
          <Pressable
            style={{ paddingLeft: 20, alignItems: "flex-start" }}
            onPress={() => navigation.navigate("Groups")}
          >
            <Image source={BackIcon} style={{ width: 50, height: 50 }}></Image>
          </Pressable>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 36 }}>Create a Group</Text>
          </View>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: width,
            height: height * 0.5,
          }}
        >
          <Input
            placeholder="Enter Group Name"
            value={groupName}
            onChangeText={(text) => {
              setGroupName(text);
              setErrorMessageGroupName("");
            }}
            errorMessage={errorMessageGroupName}
          />
          <Input
            placeholder="Enter Group Size"
            value={groupSize}
            onChangeText={(text) => {
              setGroupSize(text);
              setErrorMessageGroupSize("");
            }}
            errorMessage={errorMessageGroupSize}
          />
          <DropDownPicker
            placeholder="Select Prompt Time"
            open={promptOpen}
            value={promptTime}
            items={items}
            setOpen={setPromptOpen}
            setValue={setPromptTime}
            setItems={setItems}
            onOpen={onPromptOpen}
            maxHeight={130}
            containerStyle={{
              width: 330,
              borderBottomWidth: 0,
            }}
            style={{
              height: 60,
              color: "white",
              borderWidth: 2,
              borderColor: "#252323",
              borderRadius: 8,
              backgroundColor: "transparent",
            }}
            textStyle={{
              fontSize: 22,
              textAlign: "center",
              fontFamily: "OpenSansRegular",
              color: "grey",
            }}
            zIndex={3000}
            zIndexInverse={1000}
          />
          <View
            style={{
              margin: 4,
              alignItems: "flex-start",
              width: 320,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "red",
              }}
            >
              {errorMessagePromptTime}
            </Text>
          </View>
          <DropDownPicker
            placeholder="Select Submission Time"
            open={submissionOpen}
            value={submissionTime}
            items={items}
            setOpen={setSubmissionOpen}
            setValue={setSubmissionTime}
            setItems={setItems}
            onOpen={onSubmissionOpen}
            maxHeight={130}
            containerStyle={{
              width: 330,
              borderBottomWidth: 0,
            }}
            style={{
              height: 60,
              borderWidth: 2,
              borderColor: "#252323",
              borderRadius: 8,
              backgroundColor: "transparent",
            }}
            textStyle={{
              fontSize: 22,
              textAlign: "center",
              fontFamily: "OpenSansRegular",
              color: "grey",
            }}
            zIndex={1000}
            zIndexInverse={3000}
          />
          <View
            style={{
              margin: 4,
              alignItems: "flex-start",
              width: 320,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "red",
              }}
            >
              {errorMessageSubmissionTime}
            </Text>
          </View>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: width,
            height: Platform.OS === "ios" ? height * 0.2 : height * 0.25,
          }}
        >
          <Button onPress={handleGroupCreate}>Create Group</Button>
        </View>
        <View
          style={{
            width: width,
            height: Platform.OS === "ios" ? height * 0.08 : height * 0.045,
          }}
        ></View>
        <ErrorPrompt
          Message={errorMessageServer}
          state={errorServer}
          setError={setErrorServer}
        ></ErrorPrompt>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default CreateNewGroup;
