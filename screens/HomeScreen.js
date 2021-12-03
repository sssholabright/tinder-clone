import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native'
import useAuth from '../hooks/useAuth'
import tw from 'tailwind-rn'
import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons'
import Swiper from 'react-native-deck-swiper'
import { collection, doc, onSnapshot, query, getDocs, setDoc, where, getDoc, DocumentSnapshot, serverTimestamp } from '@firebase/firestore'
import { db } from './auth/firebase'
import generateId from '../lib/generated'
import { useNavigation } from '@react-navigation/core'

const HomeScreen = () => {
    const navigation = useNavigation();
    const [profiles, setProfiles] = useState([])
    const { logout, user } = useAuth()
    const swipeRef = useRef()

    useLayoutEffect(() => {
        const unsub = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if(!snapshot.exists()) {
                navigation.navigate('Modal')
            }
        });

        return unsub;
    }, [])

    useEffect(() => {
        let unsub;

        const fetchCards = async () => {

            const passes = await getDocs(collection(db, 'users', user.uid, 'passes')).then((snapshot) => snapshot.docs.map((doc) => doc.id))

            const matches = await getDocs(collection(db, 'users', user.uid, 'matches')).then((snapshot) => snapshot.docs.map((doc) => doc.id))

            const passedUserIds = passes.length > 0 ? passes : ['test']
            const matchedUserIds = matches.length > 0 ? matches : ['test']

            unsub = onSnapshot(query(collection(db, 'users'), where('id', 'not-in', [...passedUserIds, ...matchedUserIds])), (snapshot) => {
                setProfiles(
                    snapshot.docs
                        .filter((doc) => doc.id != user.uid)
                        .map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }))
                )
            })
        }
        fetchCards();
        return unsub;
    }, [db])

    const swipedLeft = (cardIndex) => {
        if (!profiles[cardIndex]) return;

        const userSwiped = profiles[cardIndex];
        console.log(`You swiped PASS on ${userSwiped.displayName}`)

        setDoc(doc(db, 'users', user.uid, 'passes', userSwiped.id), userSwiped);
    }

    const swipedRight = async (cardIndex) => {
        if (!profiles[cardIndex]) return;

        const userSwiped = profiles[cardIndex];
        console.log(`You swiped MATCH on ${userSwiped.displayName}`)

        const loggedInProfile = await (
            await getDoc(doc(db, 'users', user.uid))
        ).data();

        // Check if the user swiped on you...
        getDoc(doc(db, 'users', userSwiped.id, 'matches', user.uid)).then((documentSnapshot) => {
            if (documentSnapshot.exists()) {
                // user has matched with you before you matched with them
                // Create a MATCH!
                console.log(`Hooray, You MATCHED with ${userSwiped.displayName}`) 

                setDoc(doc(db, 'users', user.uid, 'matches', userSwiped.id), 
                    userSwiped)

                // Create a MATCH
                setDoc(doc(db, 'matches', generateId(user.uid, userSwiped.id)), {
                    users: {
                        [user.uid]: loggedInProfile,
                        [userSwiped.id]: userSwiped
                    },
                    usersMatched: [
                        user.uid, 
                        userSwiped.id
                    ],
                    timestamp: serverTimestamp() 
                });

                navigation.navigate("Match", {
                    loggedInProfile,
                    userSwiped,
                })

            } else {
                // user has swiped as first interaction between the two or didn't get swiped on.. 
            }
        })

        setDoc(doc(db, 'users', user.uid, 'matches', userSwiped.id), userSwiped)
        
    }

    return (
        <SafeAreaView>
            {/* Header */}
            <View style={tw('flex-row items-center justify-between px-5')}>
                <TouchableOpacity onPress={logout}>
                    <Image source={{uri: user.photoURL}} style={tw("h-10 w-10 rounded-full")} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Modal')}>
                    <Text style={{fontSize: 40, color: '#FF5864'}}>❣</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
                    <Ionicons name="chatbubbles-sharp" size={30} color="#FF5864" />
                </TouchableOpacity>
            </View>
            {/* End Of Header */}

            {/* Cards */}
            <View style={tw("flex-1 mt-6")}>
                <Swiper
                    ref={swipeRef}
                    containerStyle={{backgroundColor: 'transparent'}}
                    cards={profiles}
                    stackSize={5}
                    cardIndex={0}
                    overlayLabels={{
                        left: {
                            title: "NOPE",
                            style: {
                                label: {
                                    textAlign: "right",
                                    color: "red",
                                } 
                            }
                        },
                        right: {
                            title: "MATCH",
                            style: {
                                label: {
                                    color: "#4DCD30",
                                } 
                            }
                        }
                    }}
                    onSwipedLeft={(cardIndex) => {
                        console.log('SWIPE PASS')
                        swipedLeft(cardIndex)
                    }}
                    onSwipedRight={(cardIndex) => {
                        console.log('SWIPE MATCH')
                        swipedRight(cardIndex)
                    }}
                    backgroundColor={"#4FD0C9"}
                    animateCardOpacity
                    verticalSwipe={false}
                    renderCard={(card) => card ? (
                        <View key={card.id} style={tw("bg-white h-3/4 rounded-xl")}>
                            <Image source={{uri: card.photoURL}} style={tw("h-full w-full rounded-xl")} />
                            <View style={[tw("bg-white w-full h-20 absolute bottom-0 justify-between items-center flex-row px-6 py-2 rounded-b-xl"), styles.cardShadow]}>
                                <View>
                                    <Text style={tw("text-xl font-bold")}>{card.displayName}</Text>
                                    <Text>{card.job}</Text>
                                </View>
                                <Text style={tw("text-2xl font-bold")}>{card.age}</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={[tw('relative bg-white h-3/4 rounded-xl justify-center items-center'), styles.cardShadow]}>
                            <Text style={tw("font-bold pb-5")}>No more profiles</Text>
                            <Text style={{fontSize: 80}}>😥</Text>
                        </View>
                    )}
                />
            </View>
            {/* End Of Cards */}
            <View style={[tw("flex-1 flex-row justify-evenly"), {marginTop: 550}]}>
                <TouchableOpacity onPress={() => swipeRef.current.swipeLeft()} style={tw("items-center justify-center rounded-full w-16 h-16 bg-red-200")}>
                    <Entypo name="cross" size={24} color="red" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => swipeRef.current.swipeRight()} style={tw("items-center justify-center rounded-full w-16 h-16 bg-green-200")}>
                    <Entypo name="heart" size={24} color="green" />
                </TouchableOpacity>
            </View>
            <StatusBar barStyle="dark-content" backgroundColor="whitesmoke" />
        </SafeAreaView>
    )
}

export default HomeScreen


const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.14,
        elevation: 2
    }
})