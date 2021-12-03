import React, { useEffect } from 'react'
import { View, Text, Button, ImageBackground, TouchableOpacity } from 'react-native'
import useAuth from '../../hooks/useAuth'
import { db } from './firebase'
import tw from 'tailwind-rn'

const LoginScreen = () => {
    const { loading, signInWithGoogle } = useAuth()
    
    return (
        <View style={tw('flex-1')}>
            <ImageBackground style={tw('flex-1')} resizeMode="cover" source={require('../../assets/splash.png')}>
                <TouchableOpacity onPress={signInWithGoogle} style={[tw('absolute bottom-40 w-52 bg-white p-4 rounded-2xl'), {marginHorizontal: "25%"}]}>
                    <Text style={tw('text-center font-bold')}>Sign in & get swiping</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    )
}

export default LoginScreen
