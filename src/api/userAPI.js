import axios from './interceptor';

// export const USER_URL = `${process.env.REACT_APP_BASE_URL}/users`;
const USER_URL = 'https://tour-backend-live.onrender.com/api/v1/users';

export function addUser(obj) {
    const ADDUSER_URL = `${USER_URL}/registerUser`;
    return axios.post(ADDUSER_URL, obj);
};

export function loginUser(obj) {
    const LOGINUSER__URL = `${USER_URL}/loginUser`;
    return axios.post(LOGINUSER__URL, obj);
};

export function getAllUsers() {
    const ALLUSER__URL = `${USER_URL}/getUsers`;
    return axios.get(ALLUSER__URL);
};

export function updateUser(obj, userId) {
    const UPDATEUSER__URL = `${USER_URL}/updateUser/${userId}`;
    return axios.put(UPDATEUSER__URL, obj);
};

export function deleteUser(userId) {
    const DELETEUSER__URL = `${USER_URL}/deleteUser/${userId}`;
    return axios.delete(DELETEUSER__URL);
};