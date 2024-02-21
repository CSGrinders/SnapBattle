import {KeyboardAvoidingView, Dimensions, Text, View, Platform} from "react-native";
import SubmitIcon from "../../Components/Group/SubmitSettingsIcon.js"
import {Button, Input} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import SelectTimeButton from "../../Components/Group/SelectTime";
import {useState} from "react";

function GroupSettings({navigation}) {
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
    function submitGroupName() {
        console.log(groupName)
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
                    <BackButton size={40} navigation={navigation} destination="Main"/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 30, fontFamily: 'OpenSansBold'}}>Group Settings</Text>
                </View>
            </View>
            <View style={{
                width: width,
                height: Platform.OS === "ios" ? height * 0.6 : height * 0.7,
                justifyContent: "center"
            }}>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 20,
                    marginBottom: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Group Name
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 20,
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
                    marginHorizontal: 30,
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Group Size
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 20,
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
                    marginHorizontal: 30,
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 22,
                    fontWeight: 'bold'
                }}>
                    New Prompt Time
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 20,
                    marginBottom: 25
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
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Submission Time
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 20,
                    marginBottom: 20
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
                <View style={{
                    alignItems: 'center',
                    marginTop: 30,
                    width: width,
                    height: height * 0.01,
                }}>
                    <Button color='#A90808FF'>Delete Group</Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default GroupSettings