import React, { createContext, useState, useContext, useEffect } from 'react';
import {getLocalStorageUser, setLocalStorageUser} from "./utils/LocalStorageHelper.js";

const UserContext = createContext(undefined);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = getLocalStorageUser();
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (user) {
            setLocalStorageUser(user);
        }
        // Do we ever want to remove user data? Only if the user logs out?
        // else {
        //     localStorage.removeItem('user');
        // }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
