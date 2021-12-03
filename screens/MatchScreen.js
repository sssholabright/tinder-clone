import { useRoute } from '@react-navigation/core'
import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import tw from 'tailwind-rn'

const MatchScreen = ({navigation}) => {
    const { params } = useRoute();

    const { loggedInProfile, userSwiped } = params;

    return (
        <View style={[tw("h-full bg-red-500 pt-20"), {opacity: 0.89}]}>
            <View style={tw('justify-center px-10 pt-20')}>
                <Image source={require('../assets/prof.jpg')} style={tw("h-20  w-full")} />
            </View>
            <Text style={tw("text-white text-center mt-5")}>
                You and {userSwiped.displayName} have liked each other
            </Text>

            <View style={tw('flex-row justify-evenly mt-5')}>
                <Image source={{uri: loggedInProfile.photoURL}} style={tw("h-32 w-32 rounded-full")} />
                <Image source={{uri: userSwiped.photoURL}} style={tw("h-32 w-32 rounded-full")} />
            </View>

            <TouchableOpacity style={tw("bg-white m-5 px-10 py-8 rounded-full mt-20")} onPress={() => {
                navigation.goBack();
                navigation.navigate('Chat')
            }}>
                <Text style={tw("text-center")}>Send a Message</Text>
            </TouchableOpacity>
        </View>
    )
}

export default MatchScreen
