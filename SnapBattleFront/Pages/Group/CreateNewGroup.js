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
import SelectTimeButton from "../../Components/Group/SelectTime";

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

  // release prompt time
  const [isPromptVisible, setPromptVisible] = useState(false);
  const [promptTitle, setPromptTitle] = useState("Select Prompt Time");
  const [promptDate, setPromptDate] = useState(new Date());
  // submit prompt time
  const [isSubmitVisible, setSubmitVisible] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState("Select Submission Time");
  const [submissionDate, setSubmissionDate] = useState(new Date());

  // input field error messages
  const [errorMessageGroupName, setErrorMessageGroupName] = useState("");
  const [errorMessageGroupSize, setErrorMessageGroupSize] = useState("");
  const [errorMessagePromptTime, setErrorMessagePromptTime] = useState("");
  const [errorMessageSubmissionTime, setErrorMessageSubmissionTime] = useState("");

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
          <SelectTimeButton
            width={width}
            visibility={isPromptVisible}
            setVisibility={setPromptVisible}
            title={promptTitle}
            setTitle={setPromptTitle}
            date={promptDate}
            setDate={setPromptDate}
            setTime={setPromptTime}>
          </SelectTimeButton>
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
          <SelectTimeButton
            width={width}
            visibility={isSubmitVisible}
            setVisibility={setSubmitVisible}
            title={submissionTitle}
            setTitle={setSubmissionTitle}
            date={submissionDate}
            setDate={setSubmissionDate}
            setTime={setSubmissionTime}>
          </SelectTimeButton>
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
