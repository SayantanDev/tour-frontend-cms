import axios from './interceptor';

export const QRY_URL = `${process.env.REACT_APP_BASE_URL}/queries`;
// const QRY_URL = 'https://tour-backend-live.onrender.com/api/v1/queries';


export async function createQueries(payload) {
    const ADDUSER_URL = `${QRY_URL}/create-queries`;
    const result = await axios.post(ADDUSER_URL,payload);
    return result.data;
};

export async function getAllQueries() {
    const GETUSER_URL = `${QRY_URL}/get-all-queries`;
    const result = await axios.get(GETUSER_URL);
    return result.data;
}

export async function updateQueries(id,value) {
    const UPDATEUSER_URL = `${QRY_URL}/update-status-queries/${id}`;
    const result = await axios.put(UPDATEUSER_URL,value );
    return result.data;
    
}

