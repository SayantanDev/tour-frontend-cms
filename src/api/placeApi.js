import axios from './interceptor';

export const QRY_URL = `${process.env.REACT_APP_BASE_URL}/place`;

export async function insertPlace(payload) {
    const ADDUSER_URL = `${QRY_URL}/create`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
};

export async function updatePlace(payload,id) {
    const ADDUSER_URL = `${QRY_URL}/update/${id}`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
};

export async function getAllplaces() {
    const ADDUSER_URL = `${QRY_URL}/get-all`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

export async function getSinglePlace(id) {
    const ADDUSER_URL = `${QRY_URL}/get-single/${id}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};