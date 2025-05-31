import axios from './interceptor';

const INQRY_URL = `${process.env.REACT_APP_BASE_URL}/inquiry`;
// const INQRY_URL = 'https://tour-backend-live.onrender.com/api/v1/inquiry';

export async function getAllInquiries() {
    const ADDUSER_URL = `${INQRY_URL}/get-all-inquiries`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

// delete inquiry
export async function deleteInquiry(id) {
    const DELETE_URL = `${INQRY_URL}/delete-inquiry/${id}`;
    const result = await axios.delete(DELETE_URL);
    return result.data;
}

export async function InquiryUserAssign(payload){
    const ADDUSER_URL = `${INQRY_URL}/user-assign`;
    const result = await axios.post(ADDUSER_URL,payload);
    return result.data;
}

export async function InquiryUserRemove(payload){
    const ADDUSER_URL = `${INQRY_URL}/user-remove`;
    const result = await axios.post(ADDUSER_URL,payload);
    return result.data;
}
