// Local storage uses global browser scope
const LOCAL_STORAGE_IDENTIFIER = "ASD24"
const LOCAL_STORAGE_KEYS = {
    USER: `${LOCAL_STORAGE_IDENTIFIER}-user`,
    ROOM_ID: `${LOCAL_STORAGE_IDENTIFIER}-roomId`
}


export function setLocalStorageUser(user) {
    const userObject = {
        "id": user._id,
        "username": user.username
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(userObject));
}

export function getLocalStorageUser() {
    const userObject = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return JSON.parse(userObject);
}

// Note I added roomId to local storage because I don't know how to make it work as a state. setRoomId() is
// asynchronous, and making it an useEffect hook added more bugs than it fixed. Callbacks can't be used either.
export function setLocalStorageRoomId(roomId) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ROOM_ID, roomId);
}

export function getLocalStorageRoomId() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ROOM_ID);
}

export function removeItemLocalStorageRoomId() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ROOM_ID);
}