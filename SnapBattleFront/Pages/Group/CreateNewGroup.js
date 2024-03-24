/**
 * CreateNewGroup Component
 *
 * This component allows  users to create new groups.
 *
 * @component
 * @return {JSX.Element} Renders a user interface for creating a new group.
 */

import {Button, Input} from "@rneui/themed";
import React, {useState} from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Text,
    View,
} from "react-native";
import axios from "axios";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import SelectTimeButton from "../../Components/Group/SelectTime";
import SelectPeriodButton from "../../Components/Group/SelectPeriod";
import BackButton from "../../Components/Button/BackButton";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import SubmitIcon from "../../Components/Group/SubmitSettingsIcon";

const {EXPO_PUBLIC_API_URL} = process.env;

function CreateNewGroup({route, navigation}) {
    let {userID} = route.params;
    const {width, height} = Dimensions.get("window");

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

    // voting length
    const [isLengthVisible, setLengthVisible] = useState(false);
    const [lengthTitle, setLengthTitle] = useState("Select Duration")
    const [length, setLength] = useState("")
    const [lengthDate, setLengthDate] = useState(new Date(Date.parse("2001-01-01T00:00:00")))

    // input field error messages
    const [errorMessageGroupName, setErrorMessageGroupName] = useState("");
    const [errorMessageGroupSize, setErrorMessageGroupSize] = useState("");
    const [errorMessagePromptTime, setErrorMessagePromptTime] = useState("");
    const [errorMessageSubmissionTime, setErrorMessageSubmissionTime] = useState("");
    const [lengthError, setLengthError] = useState("");

    // server error messages
    const [errorMessageServer, setErrorMessageServer] = useState("");
    const [errorServer, setErrorServer] = useState(false);

    const [infoMessage, setInfoMessage] = useState('');
    const [infoPrompt, setInfoPrompt] = useState(false);

    const handleGroupCreate = () => {
        setErrorMessageGroupName("");
        setErrorMessageGroupSize("");
        setErrorMessagePromptTime("");
        setErrorMessageSubmissionTime("");
        setErrorServer(false);

        let error = false;
        if (!groupName) {
            setErrorMessageGroupName("Empty field.");
            error = true;
        }
        if (!groupSize) {
            setErrorMessageGroupSize("Empty field.");
            error = true;
        } else if (isNaN(parseInt(groupSize))) {
            setErrorMessageGroupSize("Field cannot contain non-numeric characters.");
            error = true;
        }

        if (!promptTime) {
            setErrorMessagePromptTime("Empty field.");
            error = true;
        }

        if (!submissionTime) {
            setErrorMessageSubmissionTime("Empty field.");
            error = true;
        }

        if (!length) {
            setLengthError("Empty field.");
            error = true;
        } else if (length == "00:00") {
            setLengthError("Length must be greater than 00:00");
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
                    timeToVote: length,
                }
            ).then((response) => {
                const groupCreated = response.data;
                if (groupCreated) {
                    setErrorMessagePromptTime('');
                    setInfoPrompt(true);
                    setInfoMessage(`Group created successfully!`);
                    setTimeout(() => {
                        navigation.navigate("Groups", {userID: userID});
                    }, 2000);
                }
            }).catch((error) => {
                const {status, data} = error.response;
                if (status === 400) {
                    setErrorMessagePromptTime(data.errorMessage)
                    setErrorMessageSubmissionTime(data.errorMessage)
                } else if (status === 402) {
                    setLengthError(data.errorMessage)
                } else {
                    setErrorMessageServer("Something went wrong...");
                    setErrorServer(true);
                    console.log("CreateGroup page: " + error);
                }
            })
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                              enabled={false} style={{flex: 1}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: height * 0.2,
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 20}}>
                    <Text style={{
                        fontSize: 32,
                        fontFamily: 'OpenSansBold'
                    }}>Create New Group</Text>
                </View>
            </View>
            <View style={{
                width: width,
                height: height * 0.6,
                justifyContent: "center",
                marginHorizontal: 20
            }}>
                <Text style={{
                    marginTop: 10,
                    marginBottom: 5,
                    marginLeft: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    Group Name
                </Text>
                <Input
                    placeholder="Enter Group Name"
                    containerStyle={{width: width * 0.9}}
                    autoCapitalize="none"
                    value={groupName}
                    onChangeText={(text) => {
                        setGroupName(text);
                        setErrorMessageGroupName("");
                    }}
                    errorMessage={errorMessageGroupName}
                />
                <Text style={{
                    marginTop: 5,
                    marginBottom: 5,
                    marginLeft: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    Group Size
                </Text>
                <Input
                    containerStyle={{width: width * 0.9}}
                    placeholder="Enter Group Size"
                    autoCapitalize="none"
                    value={groupSize}
                    onChangeText={(text) => {
                        setGroupSize(text);
                        setErrorMessageGroupSize("");
                    }}
                    errorMessage={errorMessageGroupSize}
                />
                <Text style={{
                    marginTop: 5,
                    marginBottom: 5,
                    marginLeft: 5,
                    fontSize: 22,
                    fontWeight: 'bold'
                }}>
                    Prompt Time
                </Text>
                <SelectTimeButton
                    width={width * 0.87}
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
                <Text style={{
                    marginTop: 5,
                    marginBottom: 5,
                    marginLeft: 5,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    Submission Time
                </Text>
                <SelectTimeButton
                    width={width * 0.87}
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
                <Text style={{
                    marginTop: 5,
                    marginBottom: 5,
                    marginLeft: 5,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    Voting Length
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginBottom: 6
                }}>
                    <SelectPeriodButton
                        width={width * 0.87}
                        visibility={isLengthVisible}
                        setVisibility={setLengthVisible}
                        title={lengthTitle}
                        setTitle={setLengthTitle}
                        date={lengthDate}
                        setDate={setLengthDate}
                        setTime={setLength}>
                    </SelectPeriodButton>
                </View>
                <Text
                    style={{
                        marginLeft: 8,
                        marginBottom: 10,
                        fontSize: 12,
                        color: "red",
                    }}
                >
                    {lengthError}
                </Text>
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
            <InfoPrompt Message={infoMessage} state={infoPrompt} setEnable={setInfoPrompt}></InfoPrompt>
        </KeyboardAvoidingView>
    );
}

export default CreateNewGroup;
