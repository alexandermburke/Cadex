// context/AuthContext.js

'use client';
import React, { useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth() {
    // Create a useAuth hook to access the context throughout our app
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    // Create the auth wrapper component for our application
    const [currentUser, setCurrentUser] = useState(null);
    const [userDataObj, setUserDataObj] = useState({});
    const [loading, setLoading] = useState(true);

    const isPaid =
        userDataObj?.billing?.plan === 'Pro' && userDataObj?.billing?.status;

    // Function to sign up a new user
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // Function to log in an existing user
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Function to add a username to the user's profile
    async function addUsername(user, username) {
        const usernameRef = doc(db, 'usernames', username);
        const res = await setDoc(
            usernameRef,
            {
                status: 'active',
                uid: user?.uid,
            },
            { merge: true }
        );
        return updateProfile(user, { displayName: username });
    }

    // Function to log out the current user
    function logout() {
        return signOut(auth);
    }

    // Function to refresh user data from Firestore
    const refreshUserData = async () => {
        if (!currentUser) return;
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                setUserDataObj(data);
                // Update localStorage with the latest data
                localStorage.setItem(
                    'hyr',
                    JSON.stringify({ ...data, metadata: currentUser.metadata })
                );
            } else {
                console.warn('No user data found in Firestore for user:', currentUser.uid);
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setLoading(true);
                console.log('CURRENT USER: ', user);

                setCurrentUser(user);

                if (!user) {
                    setUserDataObj({});
                    localStorage.removeItem('hyr');
                    return;
                }

                let localUserData = localStorage.getItem('hyr');
                if (!localUserData) {
                    // Fetch from Firestore if no local data
                    await fetchUserData();
                    return;
                }

                localUserData = JSON.parse(localUserData);
                if (user?.metadata?.lastLoginAt === localUserData?.metadata?.lastLoginAt) {
                    // Use local storage data if last login matches
                    console.log('Used local data');
                    setUserDataObj(localUserData);
                    return;
                }

                // Fetch from Firestore if last login doesn't match
                await fetchUserData();

                async function fetchUserData() {
                    try {
                        const docRef = doc(db, 'users', user.uid);
                        const docSnap = await getDoc(docRef);
                        console.log('Fetching user data');
                        let firebaseData = {};
                        if (docSnap.exists()) {
                            console.log('Found user data');
                            firebaseData = docSnap.data();
                            setUserDataObj(firebaseData);
                            // Cache fetched data in localStorage
                            localStorage.setItem(
                                'hyr',
                                JSON.stringify({ ...firebaseData, metadata: user.metadata })
                            );
                        } else {
                            console.warn('No user data found in Firestore for user:', user.uid);
                        }
                    } catch (err) {
                        console.log('Failed to fetch data:', err.message);
                    }
                }
            } catch (err) {
                console.log(err.message);
            } finally {
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        logout,
        login,
        addUsername,
        loading,
        userDataObj,
        setUserDataObj,
        isPaid,
        refreshUserData, // Added refreshUserData to the context
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
