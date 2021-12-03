import React, { useContext, useEffect, useMemo, useState } from 'react'
import { createContext } from 'react'
import { View, Text } from 'react-native'
import * as Google from 'expo-google-app-auth'
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from '@firebase/auth'
import { auth } from '../screens/auth/firebase'

const AuthContext = createContext({
    // initial state ...
})


const config = 
    {
        webClientId: yourWebKey,
        androidClientId: yourAndroidKey,
        iosClientId: yourIosKey,
        scopes: ["profile", "email"],
        permissions: ["public_profile", "email", "gender", "location"],
    }

export const AuthProvider = ({ children }) => {
    const [error, setError] = useState(null)
    const [user, setUser] = useState(null)
    const [loadingInitial, setLoadingInitial] = useState(true)
    const [loading, setLoading] = useState(false)

    useEffect(
        () =>
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // Logged in...
                    setUser(user)
                } else {
                    // Not Logged in                                    
                    setUser(null)
                }

                setLoadingInitial(false)
        }),
    []);

    const logout = () => {
        setLoading(true);

        signOut(auth)
        .catch(error => setError(error))
        .finally(() => setLoading(false))
    }

    const signInWithGoogle = async () => {
        setLoading(true)

        await Google.logInAsync(config)
            .then(async (logInResult) => {
                if(logInResult.type === 'success') {
                    // login...
                    const { idToken, accessToken } = logInResult;
                    const credential = GoogleAuthProvider.credential(idToken, accessToken)

                    await signInWithCredential(auth, credential);   
                }
                return Promise.reject();
            })
            .catch(error => setError(error))
            .finally(() => setLoading(false))
    };

    const memoedValue = useMemo(() => ({
        error, 
        loading, 
        logout,
        signInWithGoogle,
        user, 
    }), [error, loading, logout, signInWithGoogle, user])

    return (
        <AuthContext.Provider value={memoedValue}>
            {!loadingInitial && children}
        </AuthContext.Provider>
    )
}


export default function useAuth() {
    return useContext(AuthContext)
}