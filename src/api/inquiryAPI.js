import axios from './interceptor';

export const USER_URL = `${process.env.REACT_APP_BASE_URL}/inquiry`;

export async function getAllInquiries() {
    const ADDUSER_URL = `${USER_URL}/get-all-inquiries`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

// delete inquiry
export async function deleteInquiry(id) {
    const DELETE_URL = `${USER_URL}/delete-inquiry/${id}`;
    const result = await axios.delete(DELETE_URL);
    return result.data;
}
