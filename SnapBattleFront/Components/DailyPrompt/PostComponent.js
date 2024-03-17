import {Dimensions, FlatList, Text, View, Image, TouchableOpacity} from "react-native";
import {useRef, useState} from "react";
import Carousel from "react-native-snap-carousel";
import OtherProfilePicture from "../Profile/OtherProfilePicture";
const {width, height} = Dimensions.get('window');
import ShareIcon from "../../assets/share.png"
import CommentIcon from "../../assets/comment.webp"
import LikeIcon from "../../assets/heart.png"
import OptionsIcon from "../../assets/dotdotdot.png"



const PostComponent = ({size, posts}) => {

    //current index of the carousel
    const [activeIndex, setActiveIndex] = useState(0)
    const ref = useRef(null)

    //each item is a post w/ the same attributes as a post object in MongoDB
    function renderItem({item, index}) {
        return (
            <View style={{
                height: "100%",
            }}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10}}>
                        <OtherProfilePicture size={50} imageUrl={item.owner.profilePicture}/>
                        <View style={{flexDirection: 'column'}}>
                            <Text>{item.owner.username}</Text>
                            <Text>{new Date(item.time).getHours() + ":" + new Date(item.time).getMinutes()}</Text>
                        </View>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10}}>
                        <TouchableOpacity onPress={() => openComments(index)}>
                            <Image
                                source={CommentIcon}
                                style={{
                                    width: 30,
                                    height: 30
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openShare(index)}>
                            <Image
                                source={ShareIcon}
                                style={{
                                    width: 30,
                                    height: 30
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openOptions(index)}>
                            <Image
                                source={OptionsIcon}
                                style={{
                                    width: 30,
                                    height: 30
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            <Image
                source={{uri: item.picture}}
                style={{
                    width: width * 0.9 - 10,
                    height: (1.2) * (width * 0.9 - 10),
                }}
            />
        </View>
        )
    }

    //opens the comment section for the post at the given index in the posts array
    function openComments(index) {
        console.log("opening comments section for post #" + index)
    }

    //opens the share menu for the post at the given index in the posts array
    function openShare(index) {
        console.log("opening share menu for post #" + index)
    }

    //opens the options menu for the post at the given index in the posts array
    function openOptions(index) {
        console.log("opening options menu for post #" + index)
    }

    //conditionally render nothing or the posts carousel depending if there are posts or not
    if (posts === null || posts.length === 0) {
        return (
            <View style={{
                width: width * 0.9,
                height: "100%",
                borderWidth: 5,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text>No posts</Text>
            </View>
        )
    }
    else {
        return (
            <View style={{
                height: "100%",
                borderWidth: 5,
            }}>
                <Carousel
                    layout="default"
                    ref={ref}
                    data={posts}
                    sliderWidth={width * 0.9- 10}
                    itemWidth={width * 0.9 - 10}
                    renderItem={renderItem}
                    onSnapToItem={(index) => setActiveIndex(index)}
                    vertical={false}
                />
            </View>
        )
    }

}

export default PostComponent