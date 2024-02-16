import IoniconsIcon from 'react-native-vector-icons/Ionicons'

function BackButton({setPage, pageName}) {
    function pressBack() {
        setPage(pageName);
        console.log(pageName);
    }

    return (
        <IoniconsIcon name="arrow-back-circle" size={50} onPress={pressBack}/>
    )
}
export default BackButton;