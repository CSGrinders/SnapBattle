import {Button} from "@rneui/themed";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {View} from "react-native";

function SelectTimeButton(
    {
        width,
        visibility,
        setVisibility,
        time,
        setTime,
        date,
        setDate,
    }) {
    const showTimePicker = () => {
        setVisibility(true);
    };

    const hideTimePicker = () => {
        setVisibility(false);
    };

    const handleConfirm = (time) => {
        let hours = time.getHours() - 13 < 0 ? time.getHours() : time.getHours() - 12;
        hours = hours === 0 ? 12 : hours;
        let minutes = time.getMinutes() - 10 < 0 ? "0" + time.getMinutes().toString() : time.getMinutes().toString();
        let AMPM = time.getHours() - 12 < 0 ? "AM" : "PM";
        setTime(hours.toString() + ":" + minutes + " " + AMPM);
        setDate(time)
        hideTimePicker();
    };

    return (
        <View>
            <Button title={time} type="outline"
                    buttonStyle={{
                        borderRadius: 8,
                        borderWidth: 2,
                        width: width * 0.75,
                        height: 55,
                    }}
                    containerStyle={{
                        marginLeft: 5,
                        marginRight: 10,
                    }}
                    onPress={showTimePicker}
            />
            <DateTimePickerModal
                isVisible={visibility}
                mode="time"
                date={date}
                onConfirm={handleConfirm}
                onCancel={hideTimePicker}
            />
        </View>
    );
}
export default SelectTimeButton