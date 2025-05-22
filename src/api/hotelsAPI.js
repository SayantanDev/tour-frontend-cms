import axios from './interceptor';

export const QRY_URL = `${process.env.REACT_APP_BASE_URL}/hotel`;


export async function getAllHotels() {
    const ADDUSER_URL = `${QRY_URL}/get-all`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

export async function insertHotel(payload) {
    const ADDUSER_URL = `${QRY_URL}/create`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
};

export async function updateHotel(id,payload) {
    const ADDUSER_URL = `${QRY_URL}/update/${id}`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
};

export async function deleteHotel(id) {
    const ADDUSER_URL = `${QRY_URL}/delete/${id}`;
    const result = await axios.delete(ADDUSER_URL);
    return result.data;
};
