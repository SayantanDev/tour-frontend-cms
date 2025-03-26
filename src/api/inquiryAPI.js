import axios from './interceptor';

export const USER_URL = `${process.env.REACT_APP_BASE_URL}/inquiry`;

export async function getAllInquiries() {
    const ADDUSER_URL = `${USER_URL}/get-all-inquiries`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

