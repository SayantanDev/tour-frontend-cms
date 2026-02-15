import axios from './interceptor';

const QRY_URL = `${process.env.REACT_APP_BASE_URL}/operations`;



export async function updateFollowupDetails(id, payload) {
    const ADDUSER_URL = `${QRY_URL}/${id}/followup`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
};

export async function getSingleOperation(id) {
    const ADDUSER_URL = `${QRY_URL}/${id}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
}

export async function GuestandTripUpdateByOpt(guestId, id, payload) {
    const ADDUSER_URL = `${QRY_URL}/guest-trip/${guestId}/${id}}`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
}

export async function getQueriesByoperation(id) {
    const ADDUSER_URL = `${QRY_URL}/get-query/${id}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
}

export async function addChangeRequest(id, payload) {
    const ADDUSER_URL = `${QRY_URL}/change-request/${id}`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
}

export async function addChangeRequestForItineray(id, payload) {
    const ADDUSER_URL = `${QRY_URL}/change-request-itineray/${id}`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
}

export async function getChangeRequest(id) {
    const ADDUSER_URL = `${QRY_URL}/change-request/${id}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
}
export async function handleChangeRequestApproval(optId, crvId, payload) {
    const ADDUSER_URL = `${QRY_URL}/${optId}/changes/${crvId}`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
}
export async function getRejectedChanges(id) {
    const ADDUSER_URL = `${QRY_URL}/rejected-changes/${id}`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
}

export async function verifyItinerary(operationId, index, status, reason = "") {
    const ADDUSER_URL = `${QRY_URL}/${operationId}/verify-itinerary/${index}`;
    const result = await axios.put(ADDUSER_URL, {
        approved_status: status,
        rejected_reason: reason
    });
    return result.data;
}