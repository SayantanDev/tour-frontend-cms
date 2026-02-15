import axios from './interceptor';

const QRY_URL = `${process.env.REACT_APP_BASE_URL}/queries`;

export async function createQueries(payload) {
    const ADDUSER_URL = `${QRY_URL}/create-queries`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
};

export async function getAllQueries(page, size) {
    try {
        const GETUSER_URL = `${QRY_URL}/get-all-queries`;
        const result = await axios.get(GETUSER_URL, {
            params: {
                page: page,
                size: size
            }
        });
        return result.data;
    } catch (error) {
        console.error('Error fetching queries:', error);
        throw error;
    }
}

export async function updateQueries(id, value) {
    const UPDATEUSER_URL = `${QRY_URL}/update-single-field/${id}`;
    const result = await axios.patch(UPDATEUSER_URL, value);
    return result.data;
}

export async function fetchOperationByQueries(id) {
    const GETUSER_URL = `${QRY_URL}/fetch-operation/${id}`;
    const result = await axios.get(GETUSER_URL);
    return result.data;
}

export async function assignUsersToQueries(payload) {
    const UPDATEUSER_URL = `${QRY_URL}/assign-users`;
    const result = await axios.patch(UPDATEUSER_URL, payload);
    return result.data;
}
export async function removeUsersFromQueries(payload) {
    const UPDATEUSER_URL = `${QRY_URL}/remove-users`;
    const result = await axios.patch(UPDATEUSER_URL, payload);
    return result.data;
}

export async function deleteQueries(id) {
    const DELETEUSER_URL = `${QRY_URL}/delete-queries/${id}`;
    const result = await axios.delete(DELETEUSER_URL);
    return result.data;
}

