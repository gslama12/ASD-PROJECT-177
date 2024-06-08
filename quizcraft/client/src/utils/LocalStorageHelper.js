// Local storage uses global browser scope
const LOCAL_STORAGE_IDENTIFIER = "ASD24"
const LOCAL_STORAGE_KEYS = {
    USER: `${LOCAL_STORAGE_IDENTIFIER}-user`
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
