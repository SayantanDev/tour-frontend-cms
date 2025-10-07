import axios from './interceptor';

export const QRY_URL = `${process.env.REACT_APP_BASE_URL}/permission`;

export async function createPermission(payload) {
    const ADDUSER_URL = `${QRY_URL}`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
};

export async function getAllPermission() {
    const ADDUSER_URL = `${QRY_URL}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

export async function getPermission(id) {
    const ADDUSER_URL = `${QRY_URL}/${id}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

export async function updatePermission(id,payload) {
    const ADDUSER_URL = `${QRY_URL}/${id}`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
};

export async function deletePermission(id) {
    const ADDUSER_URL = `${QRY_URL}/${id}`;
    const result = await axios.delete(ADDUSER_URL);
    return result.data;
};