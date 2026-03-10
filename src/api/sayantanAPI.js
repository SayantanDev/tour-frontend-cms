import axios from './interceptor';

const BASE_URL = `${process.env.REACT_APP_BASE_URL}`;

export function getContactedSayantan() {
    return axios.get(`${BASE_URL}/Sayantan/getContactedSayantan`);
}

export function deleteContactedSayantan(id) {
    return axios.delete(`${BASE_URL}/Sayantan/deleteContactedSayantan/${id}`);
}
