import React, { useState } from 'react'
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import tw from 'tailwind-rn'
import useAuth from '../hooks/useAuth'
import { doc, serverTimestamp, setDoc } from '@firebase/firestore'
import { db } from './auth/firebase'

const ModalScreen = ({navigation}) => {
    const { user } = useAuth()
    const [image, setImage] = useState(null)
    const [job, setJob] = useState(null)
    const [age, setAge] = useState(null)

    const incompleteForm = !image || !job || !age;

    const updateUserProfile = () => {
        setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            displayName: user.displayName,
            photoURL: image,
            job: job,
            age: age,
            timestamp: serverTimestamp()
        }).then(() => {
            navigation.goBack()
        }).catch((error) => alert(error.message));
    }

    return (
        <View style={tw('flex-1 items-center pt-1')}>
            <Image 
                /*source={require('../assets/prof.jpg')}*/ 
                style={tw("h-20 w-full")} 
                resizeMode="contain" 
            />

            <Text style={tw("text-xl text-gray-500 p-2 font-bold")}>Welcome, {user.displayName} </Text>
            <Text style={tw("text-center p-4 font-bold text-red-400")}>Step 1: The Profile Pic</Text>
            <TextInput 
                placeholder="Enter a Profile Pic URL" 
                style={tw("text-center p-4 font-bold text-red-400")} 
                onChangeText={(text) => setImage(text)} 
                value={image} 
            />

            <Text style={tw("text-center p-4 font-bold text-red-400")}>Step 2: The Job</Text>
            <TextInput 
                placeholder="Enter your occupation" 
                style={tw("text-center p-4 font-bold text-red-400")} 
                onChangeText={(text) => setJob(text)} 
                value={job} 
            />

            <Text style={tw("text-center p-4 font-bold text-red-400")}>Step 3: The Age</Text>
            <TextInput 
                placeholder="Enter your age" 
                style={tw("text-center p-4 font-bold text-red-400")} 
                onChangeText={(text) => setAge(text)} 
                value={age} 
                keyboardType="numeric"
            />

            <TouchableOpacity 
                style={
                    [
                        tw("w-64 p-3 rounded-xl absolute bottom-0 bg-red-400"), 
                        incompleteForm ? 
                            tw('bg-gray-400') : 
                            tw('bg-red-400')
                    ]
                } 
                disabled={incompleteForm}
                onPress={updateUserProfile}>
                <Text style={tw("text-center text-white text-xl")}>Update Profile</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ModalScreen
