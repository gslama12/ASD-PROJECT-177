import React, { createContext, useState, useContext, useEffect } from 'react';
import {getLocalStorageUser, setLocalStorageUser} from "./utils/LocalStorageHelper.js";

const UserContext = createContext(undefined);

// Note: Used fields: "username" and "_id"
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = getLocalStorageUser();
        if (savedUser) {
            // Check if the user id is stored as .id or ._id and normalize it to ._id
            if (savedUser.id && !savedUser._id) {
                savedUser._id = savedUser.id;
                delete savedUser.id;
            }
            return savedUser;
        }
        return null;
    });

    useEffect(() => {
        if (user) {
            const userLocalStorage = getLocalStorageUser();
            if (!userLocalStorage?._id || user._id) {
                setLocalStorageUser(user);
            }
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};