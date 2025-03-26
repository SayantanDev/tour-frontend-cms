import axios from './interceptor';

export const USER_URL = `${process.env.REACT_APP_BASE_URL}/queries`;

export async function createQueries(payload) {
    const ADDUSER_URL = `${USER_URL}/create-queries`;
    const result = await axios.post(ADDUSER_URL,payload);
    return result.data;
};

export async function getAllQueries() {
    const GETUSER_URL = `${USER_URL}/get-all-queries`;
    const result = await axios.get(GETUSER_URL);
    return result.data;
}

