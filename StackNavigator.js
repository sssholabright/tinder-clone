import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import useAuth from './hooks/useAuth'
import LoginScreen from './screens/auth/LoginScreen'
import ChatScreen from './screens/ChatScreen'
import HomeScreen from './screens/HomeScreen'
import MatchScreen from './screens/MatchScreen'
import MessagesScreen from './screens/MessagesScreen'
import ModalScreen from './screens/ModalScreen'

const Stack = createStackNavigator()

const StackNavigator = () => {
    const { user } = useAuth()
    return (
        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="">
            {user ? (
                <>
                    <Stack.Group>
                        <Stack.Screen name="Home" component={HomeScreen}  />
                        <Stack.Screen name="Chat" component={ChatScreen}  />
                        <Stack.Screen name="Message" component={MessagesScreen}  />
                    </Stack.Group>
                    <Stack.Group screenOptions={{ presentation: "modal" }}>
                        <Stack.Screen name="Modal" component={ModalScreen}  />
                    </Stack.Group>
                    <Stack.Group screenOptions={{ presentation: "transparentModal" }}>
                        <Stack.Screen name="Match" component={MatchScreen}  />
                    </Stack.Group>
                </>
            ):(
                <Stack.Screen name="Login" component={LoginScreen}  />
            )}
        </Stack.Navigator>
    )
}

export default StackNavigator
