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
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userDataObj, setUserDataObj] = useState({});
    const [loading, setLoading] = useState(true);

    // Updated logic to include "Demo" plan
    // This will be true if plan is "Pro" or "Demo" AND billing status is truthy.
    const isPaid =
        (userDataObj?.billing?.plan === 'Pro' ||
            userDataObj?.billing?.plan === 'Demo') &&
        userDataObj?.billing?.status;

    // 1) Normal sign-up
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // 2) Normal login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // 3) Add username
    async function addUsername(user, username) {
        const usernameRef = doc(db, 'usernames', username);
        await setDoc(
            usernameRef,
            {
                status: 'active',
                uid: user?.uid,
            },
            { merge: true }
        );
        return updateProfile(user, { displayName: username });
    }

    // 4) Logout
    function logout() {
        return signOut(auth);
    }

    // 5) Refresh user data
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

    // 6) Demo login function (no code required)
    function demoLogin() {
        // Create a fake user object
        const demoUser = {
            uid: 'demo-user-uid',
            email: 'default@default.com',
            metadata: { lastLoginAt: Date.now().toString() },
        };

        // User data with plan "Demo"
        const demoUserData = {
            billing: {
                plan: 'Demo',
                status: true, // treat as "active"
            },
            email: 'default@default.com',
            createdAt: new Date().toISOString(),
        };

        // Update state & localStorage
        setCurrentUser(demoUser);
        setUserDataObj(demoUserData);
        localStorage.setItem(
            'hyr',
            JSON.stringify({ ...demoUserData, metadata: demoUser.metadata })
        );
    }

    // 7) onAuthStateChanged effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setLoading(true);
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
                if (user?.metadata?.lastLoginAt === localUserData?.metadata?.lastLoginAt) {
                    setUserDataObj(localUserData);
                    return;
                }

                await fetchUserData();

                async function fetchUserData() {
                    try {
                        const docRef = doc(db, 'users', user.uid);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            const firebaseData = docSnap.data();
                            setUserDataObj(firebaseData);
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

    // 8) Provide context value
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
        demoLogin, // Expose demoLogin here
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
