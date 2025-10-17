import axios from './interceptor';

export const QRY_URL = `${process.env.REACT_APP_BASE_URL}/user-permission`;

export async function createUserPermission(payload) {
    const ADDUSER_URL = `${QRY_URL}`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
};

export async function getAllUserPermission() {
    const ADDUSER_URL = `${QRY_URL}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

export async function getUserPermission(id) {
    const ADDUSER_URL = `${QRY_URL}/${id}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

export async function updateUserPermission(id,payload) {
    const ADDUSER_URL = `${QRY_URL}/${id}`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
};

export async function deleteUserPermission(id) {
    const ADDUSER_URL = `${QRY_URL}/${id}`;
    const result = await axios.delete(ADDUSER_URL);
    return result.data;
};