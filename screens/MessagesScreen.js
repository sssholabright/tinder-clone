import React, { useEffect, useState } from 'react'
import { View, TextInput, Button, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Keyboard, FlatList } from 'react-native'
import Header from '../components/Header'
import getMatchedUserInfo from '../lib/getMatchedUserInfo'
import useAuth from '../hooks/useAuth'
import { useRoute } from '@react-navigation/core'
import tw from 'tailwind-rn'
import SenderMessage from '../components/SenderMessage'
import ReceiverMessage from '../components/ReceiverMessage'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from '@firebase/firestore'
import { db } from './auth/firebase'

const MessagesScreen = () => {
    const { user } = useAuth()
    const { params } = useRoute()
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState([])

    const { matchDetails } = params;

    useEffect(
        () => 
            onSnapshot(
                query(
                    collection(db, 'matches', matchDetails.id, 'messages'), 
                    orderBy('timestamp', 'desc')
                ), 
                (snapshot) => 
                    setMessages(
                        snapshot.docs.map((doc) => ({
                            id: doc.id, 
                            ...doc.data()
                        }))
                    )
            ),
        [matchDetails, db]
    )

    const sendMessage = () => {
        addDoc(collection(db, 'matches', matchDetails.id, 'messages'), {
            timestamp: serverTimestamp(),
            userId: user.uid,
            displayName: user.displayName,
            photoURL: matchDetails.users[user.uid].photoURL,
            message: input
        })

        setInput("");
    } 

    return (
        <SafeAreaView style={tw("flex-1")}>
            <Header title={getMatchedUserInfo(matchDetails.users, user.uid).displayName} callEnabled />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? "padding" : "height"} 
                style={tw("flex-1")}
                keyboardVerticalOffset={10}>

                <ScrollView onPress={Keyboard.dismiss}>
                    <FlatList 
                        data={messages} 
                        inverted={-2}
                        style={tw("pl-4")}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item: message }) => message.userId === user.uid ? (
                            <SenderMessage key={message.id} message={message} />
                        ):(
                            <ReceiverMessage key={message.id} message={message} />
                        )}   
                    />
                </ScrollView> 
            </KeyboardAvoidingView>

                <View style={[tw("flex-row justify-between items-center bg-white border-t border-gray-200 px-5 py-2"),]}>
                <TextInput 
                    style={tw("h-12 text-lg")}
                    placeholder="Send Message..."
                    onChangeText={setInput}
                    onSubmitEditing={sendMessage}
                    value={input} 
                />

                <Button title="Send" color="#FF5864" onPress={sendMessage} />
            </View>

            
        </SafeAreaView>
    )
}

export default MessagesScreen
