import axios from './interceptor';

const QRY_URL = `${process.env.REACT_APP_BASE_URL}/configString`;


export async function configString() {
    const ADDUSER_URL = `${QRY_URL}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};


