import {KeyboardAvoidingView, Dimensions, Text, View, Platform} from "react-native";
import SubmitIcon from "../../Components/Group/SubmitSettingsIcon.js"
import {Button, Input} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import SelectTimeButton from "../../Components/Group/SelectTime";
import {useState} from "react";
import axios from "axios";
import InfoPrompt from "../../Components/InfoPrompt";
import ErrorPrompt from "../../Components/ErrorPrompt";
const { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_TOKEN, EXPO_PUBLIC_USER_INFO } =
    process.env;

function GroupSettings({route, navigation}) {
    const {name, username, email, userID, groupID} = route.params
    // UI formatting
    let {width, height} = Dimensions.get('window')
    // group name
    const [groupName, setGroupName] = useState("")
    // group size
    const [groupSize, setGroupSize] = useState("")
    // release prompt time
    const [isPromptVisible, setPromptVisible] = useState(false);
    const [promptTime, setPromptTime] = useState("Select Time");
    const [promptDate, setPromptDate] = useState(new Date());
    // submit prompt time
    const [isSubmitVisible, setSubmitVisible] = useState(false);
    const [submissionTime, setSubmissionTime] = useState("Select Time");
    const [submissionDate, setSubmissionDate] = useState(new Date());
    // error messages
    const [groupNameError, setGroupNameError] = useState("")
    const [groupSizeError, setGroupSizeError] = useState("")
    const [promptTimeError, setPromptTimeError] = useState("")
    const [submissionTimeError, setSubmissionTimeError] = useState("")
    // success prompts
    const [successMessage, setSuccessMessage] = useState("")
    const [successState, setSuccessState] = useState(false)
    // error prompts
    const [errorMessage, setErrorMessage] = useState("")
    const [errorState, setErrorState] = useState(false)
    function submitGroupName() {
        let error = false;
        if (!groupName) {
            setGroupNameError("Field cannot be empty!")
            error = true;
        }
        if (!error) {
            console.log(groupName)
            axios.post(
                `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/groupname`,
                {
                    groupName: groupName
                }
            ).then((response) => {
                const {nameChange} = response.data;
                if (nameChange) {
                    setSuccessMessage("Group Name Change Success!")
                    setSuccessState(true);
                }
            }).catch((error) => {
                const {status, data} = error.response;
                setErrorMessage(data);
                setErrorState(true);
            })
        }

    }
    function submitGroupSize() {
        console.log(groupSize)
    }
    function submitPromptTime() {
        console.log(promptTime)
    }
    function submitSubmissionTime() {
        console.log(submissionTime)
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                              enabled={false}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: height * 0.2,
                width: width * 0.9,
            }}>
                <View style={{paddingLeft: 20, alignItems: 'flex-start'}}>
                    <BackButton size={40} navigation={navigation} destination={"GroupHome"} params={route.params}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 30, fontFamily: 'OpenSansBold'}}>Group Settings</Text>
                </View>
            </View>
            <View style={{
                width: width,
                height: Platform.OS === "ios" ? height * 0.6 : height * 0.7,
                justifyContent: "center",
                marginHorizontal: 20
            }}>
                <Text style={{
                    marginTop: 20,
                    marginBottom: 10,
                    marginLeft: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Group Name
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                }}>
                    <Input
                        placeholder='Enter Group Name'
                        containerStyle={{width: width * 0.8}}
                        value={groupName}
                        onChangeText={(text) => {
                            setGroupName(text);
                            setGroupNameError("");
                        }}
                        errorMessage={groupNameError}>
                    </Input>
                    <SubmitIcon size={50} submitPressed={submitGroupName}/>
                </View>
                <Text style={{
                    marginTop: 10,
                    marginBottom: 10,
                    marginLeft: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Group Size
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                }}>
                    <Input
                        placeholder='Enter Group Size'
                        containerStyle={{width: width * 0.8}}
                        value={groupSize}
                        onChangeText={(text) => {
                            setGroupSize(text);
                            setGroupNameError("");
                        }}
                        errorMessage={groupSizeError}>
                    </Input>
                    <SubmitIcon size={50} submitPressed={submitGroupSize}/>
                </View>
                <Text style={{
                    marginTop: 10,
                    marginBottom: 10,
                    marginLeft: 5,
                    fontSize: 22,
                    fontWeight: 'bold'
                }}>
                    New Prompt Time
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginBottom: 6
                }}>
                    <SelectTimeButton
                        width={width}
                        visibility={isPromptVisible}
                        setVisibility={setPromptVisible}
                        time={promptTime}
                        setTime={setPromptTime}
                        date={promptDate}
                        setDate={setPromptDate}>
                    </SelectTimeButton>
                    <SubmitIcon size={50} submitPressed={submitPromptTime}/>
                </View>
                <Text
                    style={{
                        marginLeft: 8,
                        marginBottom: 10,
                        fontSize: 12,
                        color: "red",
                    }}
                >
                    {submissionTimeError}
                </Text>
                <Text style={{
                    marginTop: 10,
                    marginBottom: 10,
                    marginLeft: 5,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Submission Time
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginBottom: 6
                }}>
                    <SelectTimeButton
                        width={width}
                        visibility={isSubmitVisible}
                        setVisibility={setSubmitVisible}
                        time={submissionTime}
                        setTime={setSubmissionTime}
                        date={submissionDate}
                        setDate={setSubmissionDate}>
                    </SelectTimeButton>
                    <SubmitIcon size={50} submitPressed={submitSubmissionTime}/>
                </View>
                <Text
                    style={{
                        marginLeft: 8,
                        marginBottom: 20,
                        fontSize: 12,
                        color: "red",
                    }}
                >
                    {submissionTimeError}
                </Text>
            </View>
            <View style={{
                alignItems: 'center',
                marginTop: 30,
                width: width,
                height: height * 0.01,
            }}>
                <Button color='#A90808FF'>Delete Group</Button>
            </View>
            <ErrorPrompt Message={errorMessage} state={errorState} setError={setErrorState}></ErrorPrompt>
            <InfoPrompt Message={successMessage} state={successState} setEnable={setSuccessState}></InfoPrompt>
        </KeyboardAvoidingView>
    )
}

export default GroupSettings