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
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userDataObj, setUserDataObj] = useState({});
    const [loading, setLoading] = useState(true);

    const isPaid =
        userDataObj?.billing?.plan === 'Pro' && userDataObj?.billing?.status;

    // Sign up a new user
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // Log in an existing user
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    /**
     * Add a username to the user's profile and create documents in Firestore.
     * 1) Create/update a doc in 'usernames/{username}' with the user's UID.
     * 2) Create/update a doc in 'users/{uid}' with basic user info.
     * 3) Update the Firebase Auth profile (displayName).
     */
    async function addUsername(user, username) {
        // 1) Write to "usernames" collection
        await setDoc(
            doc(db, 'usernames', username),
            {
                status: 'active',
                uid: user?.uid,
            },
            { merge: true }
        );
        
        // 2) Write to "users" collection
        await setDoc(
            doc(db, 'users', user.uid),
            {
                displayName: username,
                email: user.email || null,
                createdAt: serverTimestamp(),
            },
            { merge: true }
        );

        // 3) Update displayName in Auth
        return updateProfile(user, { displayName: username });
    }

    // Log out the current user
    function logout() {
        return signOut(auth);
    }

    // Refresh user data from Firestore
    const refreshUserData = async () => {
        if (!currentUser) return;
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                setUserDataObj(data);
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
                    await fetchUserData();
                    return;
                }

                localUserData = JSON.parse(localUserData);
                if (
                    user?.metadata?.lastLoginAt === localUserData?.metadata?.lastLoginAt
                ) {
                    // Use local storage data if last login matches
                    console.log('Used local data');
                    setUserDataObj(localUserData);
                    return;
                }

                // Otherwise, fetch from Firestore
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
                            localStorage.setItem(
                                'hyr',
                                JSON.stringify({
                                    ...firebaseData,
                                    metadata: user.metadata,
                                })
                            );
                        } else {
                            console.warn(
                                'No user data found in Firestore for user:',
                                user.uid
                            );
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
        refreshUserData,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
