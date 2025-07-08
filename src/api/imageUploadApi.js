import axios from './interceptor';

export const QRY_URL = `${process.env.REACT_APP_BASE_URL}/image`;


export async function getImages(schema, id) {
    const ADDUSER_URL = `${QRY_URL}/get/${schema}/${id}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

export async function imageUpload(schema,id,payload) {
    const ADDUSER_URL = `${QRY_URL}/upload/${schema}/${id}`;
    const result = await axios.post(ADDUSER_URL,payload);
    return result.data;
};

export async function imageDelete(schema,id,payload) {
    const ADDUSER_URL = `${QRY_URL}/delete/${schema}/${id}`;
    const result = await axios.delete(ADDUSER_URL,payload);
    return result.data;
};