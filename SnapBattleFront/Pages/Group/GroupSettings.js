/**
 * GroupSettings Component
 *
 * This component allow administrator modify their group settings.
 *
 * @component
 * @return {JSX.Element} Renders a user page for managing the settings of a group.
 */

import {KeyboardAvoidingView, Dimensions, Text, View, Platform, Modal, Pressable} from "react-native";
import SubmitIcon from "../../Components/Group/SubmitSettingsIcon.js";
import {Button, Input} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import SelectTimeButton from "../../Components/Group/SelectTime";
import {useState} from "react";
import axios from "axios";
import InfoPrompt from "../../Components/Prompts/InfoPrompt";
import ErrorPrompt from "../../Components/Prompts/ErrorPrompt";
import {Image} from "expo-image";
import CloseButton from "../../assets/close.webp";

const {EXPO_PUBLIC_API_URL} = process.env;

function GroupSettings({route, navigation}) {
    const {userID, username, groupID} = route.params;
    // UI formatting
    let {width, height} = Dimensions.get('window');

    // group name
    const [groupName, setGroupName] = useState("");

    // group size
    const [groupSize, setGroupSize] = useState("");

    // release prompt time
    const [isPromptVisible, setPromptVisible] = useState(false);
    const [promptTitle, setPromptTitle] = useState("Select Time");
    const [promptTime, setPromptTime] = useState("");
    const [promptDate, setPromptDate] = useState(new Date());

    // submit prompt time
    const [isSubmitVisible, setSubmitVisible] = useState(false);
    const [submissionTitle, setSubmissionTitle] = useState("Select Time");
    const [submissionTime, setSubmissionTime] = useState("");
    const [submissionDate, setSubmissionDate] = useState(new Date());

    // error messages
    const [groupNameError, setGroupNameError] = useState("");
    const [groupSizeError, setGroupSizeError] = useState("");
    const [promptTimeError, setPromptTimeError] = useState("");
    const [submissionTimeError, setSubmissionTimeError] = useState("");

    // success prompts
    const [successMessage, setSuccessMessage] = useState("");
    const [successState, setSuccessState] = useState(false);

    // error prompts
    const [errorMessage, setErrorMessage] = useState("");
    const [errorState, setErrorState] = useState(false);

    //Prompt delete
    const [confirm, setConfirm] = useState(false);
    const [confirmStatus, setConfirmStatus] = useState('');
    const [confirmUsername, setConfirmUsername] = useState('');

    function submitGroupName() {
        let error = false;
        if (!groupName) {
            setGroupNameError("Empty field.")
            error = true;
        }
        if (!error) {
            axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/groupname`, {
                groupName: groupName,
            })
                .then((response) => {
                    const {nameChanged} = response.data;
                    if (nameChanged) {
                        setSuccessMessage("Group Name has been changed!");
                        setSuccessState(true);
                    }
                })
                .catch((error) => {
                    const {status, data} = error.response;
                    if (error.response) {
                        if (status !== 500) {
                            setGroupNameError(data.errorMessage);
                        } else {
                            console.log("Group Settings page: " + error);
                            setErrorMessage(data.errorMessage);
                            setErrorState(true);
                        }
                    } else {
                        console.log("Group Settings page: " + error);
                        setErrorMessage("Something went wrong...");
                        setErrorState(true);
                    }
                })
        }
    }

    function submitGroupSize() {
        let error = false;
        if (!groupSize) {
            setGroupSizeError("Empty field.");
            error = true;
        }
        if (isNaN(parseInt(groupSize))) {
            setGroupSizeError("Field cannot contain non-numeric characters.");
            error = true;
        }
        if (!error) {
            axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/groupsize`, {
                groupSize: groupSize,
            })
                .then((response) => {
                    const {sizeChanged} = response.data;
                    if (sizeChanged) {
                        setSuccessMessage("Group size has been changed!");
                        setSuccessState(true);
                    }
                })
                .catch((error) => {
                    const {status, data} = error.response;
                    if (error.response) {
                        if (status !== 500) {
                            setGroupNameError(data.errorMessage);
                        } else {
                            console.log("Group Settings page: " + error);
                            setErrorMessage(data.errorMessage);
                            setErrorState(true);
                        }
                    } else {
                        console.log("Group Settings page: " + error);
                        setErrorMessage("Something went wrong...");
                        setErrorState(true);
                    }
                })
        }
    }

    function submitPromptTime() {
        setPromptTimeError("");
        let error = false;
        if (!promptTime) {
            setGroupNameError("Select a new prompt time.");
            error = true;
        }
        if (!error) {
            axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/prompttime`, {
                promptTime: promptTime,
            })
                .then((response) => {
                    const {promptTimeChanged} = response.data;
                    if (promptTimeChanged) {
                        setSuccessMessage("Prompt time has been changed!");
                        setSuccessState(true);
                    }
                })
                .catch((error) => {
                    const {status, data} = error.response;
                    if (error.response) {
                        if (status !== 500) {
                            setPromptTimeError(data.errorMessage);
                        } else {
                            console.log("Group Settings page: " + error);
                            setErrorMessage(data.errorMessage);
                            setErrorState(true);
                        }
                    } else {
                        console.log("Group Settings page: " + error);
                        setErrorMessage("Something went wrong...");
                        setErrorState(true);
                    }
                })
        }
    }

    function submitSubmissionTime() {
        setSubmissionTimeError("");
        let error = false;
        if (!submissionTime) {
            setGroupNameError("Select a new submission time.");
            error = true;
        }
        if (!error) {
            axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/submissiontime`, {
                submissionTime: submissionTime,
            })
                .then((response) => {
                    const {submissionTimeChanged} = response.data;
                    if (submissionTimeChanged) {
                        setSuccessMessage("Submission time has been changed!");
                        setSuccessState(true);
                    }
                })
                .catch((error) => {
                    const {status, data} = error.response;
                    if (error.response) {
                        if (status !== 500) {
                            setSubmissionTimeError(data.errorMessage);
                        } else {
                            console.log("Group Settings page: " + error);
                            setErrorMessage(data.errorMessage);
                            setErrorState(true);
                        }
                    } else {
                        console.log("Group Settings page: " + error);
                        setErrorMessage("Something went wrong...");
                        setErrorState(true);
                    }
                })
        }
    }

    function deleteGroup() {
        setConfirm(false);
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/delete-group`
        )
            .then((res) => {
                setSuccessState(true);
                setSuccessMessage("Group Deleted successfully...");
                setTimeout(() => {
                    navigation.navigate("Groups", {getGroupsState: true});
                }, 2000);
            })
            .catch((error) => {
                const {status, data} = error.response;
                if (error.response) {
                    if (status !== 500) {
                        setGroupNameError(data.errorMessage);
                    } else {
                        console.log("Group Settings page: " + error);
                        setErrorMessage(data.errorMessage);
                        setErrorState(true);
                    }
                } else {
                    console.log("Group Settings page: " + error);
                    setErrorMessage("Something went wrong...");
                    setErrorState(true);
                }
            })
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                              enabled={false} style={{fle: 1}}>
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
                    <Text style={{fontSize: 32, fontFamily: 'OpenSansBold'}}>Group Settings</Text>
                </View>
            </View>
            <View style={{
                width: width,
                height: height * 0.6,
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
                        autoCapitalize="none"
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
                        autoCapitalize="none"
                        onChangeText={(text) => {
                            setGroupSize(text);
                            setGroupSizeError("");
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
                        width={width * 0.75}
                        visibility={isPromptVisible}
                        setVisibility={setPromptVisible}
                        title={promptTitle}
                        setTitle={setPromptTitle}
                        date={promptDate}
                        setDate={setPromptDate}
                        setTime={setPromptTime}>
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
                    {promptTimeError}
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
                        width={width * 0.75}
                        visibility={isSubmitVisible}
                        setVisibility={setSubmitVisible}
                        title={submissionTitle}
                        setTitle={setSubmissionTitle}
                        date={submissionDate}
                        setDate={setSubmissionDate}
                        setTime={setSubmissionTime}>
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
                marginTop: 40,
                width: width,
                height: height * 0.01,
            }}>
                <Button onPress={() => {setConfirm(true)}}>Delete Group</Button>
            </View>
            <ErrorPrompt Message={errorMessage} state={errorState} setError={setErrorState}></ErrorPrompt>
            <InfoPrompt Message={successMessage} state={successState} setEnable={setSuccessState}></InfoPrompt>
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirm}
                onRequestClose={() => {
                    setConfirm(false);
                    setConfirmStatus('');
                }}>
                <View style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderColor: 'black',
                        borderWidth: 2,
                        borderRadius: 8,
                        padding: 10,
                    }}>
                        <Pressable onPress={() => {
                            setConfirm(false);
                            setConfirmUsername('');
                            setConfirmStatus('');
                        }}>
                            <Image
                                source={CloseButton}
                                style={{
                                    width: 30,
                                    height: 30,
                                    marginLeft: 'auto',
                                }}
                                rcontentFit="cover"
                                transition={500}
                            />
                        </Pressable>
                        <View style={{
                            flex: 0,
                            alignItems: 'center'

                        }}>
                            <View style={{marginBottom: 10}}>
                                <Text>Enter your username: <Text style={{fontFamily: 'OpenSansBold'}}> {username}</Text> to confirm the action.</Text>
                            </View>
                            <Input
                                placeholder='Confirm action.'
                                onChangeText={username => {
                                    setConfirmUsername(username);
                                    setConfirmStatus('');
                                }}
                                autoCapitalize="none"
                                errorMessage={confirmStatus}
                            />
                            <View style={{marginTop: 10}}>
                                <Button onPress={() => {deleteGroup()}}>Confirm</Button>

                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    )
}

export default GroupSettings;