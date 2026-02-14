import axios from './interceptor';

export const HOTEL_URL = `${process.env.REACT_APP_BASE_URL}/hotel`;

export function getAllHotels() {
    const GET_URL = `${HOTEL_URL}/get-all`;
    return axios.get(GET_URL);
}

export function getSingleHotel(id) {
    const GET_URL = `${HOTEL_URL}/get/${id}`;
    return axios.get(GET_URL);
}

export function createHotel(obj) {
    const CREATE_URL = `${HOTEL_URL}/create`;
    return axios.post(CREATE_URL, obj);
}

export function updateHotel(id, obj) {
    const UPDATE_URL = `${HOTEL_URL}/update/${id}`;
    return axios.put(UPDATE_URL, obj);
}

export function deleteHotel(id) {
    const DELETE_URL = `${HOTEL_URL}/delete/${id}`;
    return axios.delete(DELETE_URL);
}
