import axios from './interceptor';

// const USER_URL = `${process.env.REACT_APP_BASE_URL}/inquiry`;
const INQR_URL = 'https://tour-backend-live.onrender.com/api/v1/inquiry';

export async function getAllInquiries() {
    const ADDUSER_URL = `${INQR_URL}/get-all-inquiries`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

