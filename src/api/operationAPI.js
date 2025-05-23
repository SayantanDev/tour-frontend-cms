import axios from './interceptor';

export const QRY_URL = `${process.env.REACT_APP_BASE_URL}/operations`;



export async function updateFollowupDetails(id,payload) {
    const ADDUSER_URL = `${QRY_URL}/${id}/followup`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
};

export async function getSingleOperation(id) {
    const ADDUSER_URL = `${QRY_URL}/${id}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
}

export async function GuestandTripUpdateByOpt(guestId,id,payload) {
    const ADDUSER_URL = `${QRY_URL}/guest-trip/${guestId}/${id}}`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
}
