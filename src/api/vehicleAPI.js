import axios from './interceptor';

export const QRY_URL = `${process.env.REACT_APP_BASE_URL}/vehicle`;


export async function getAllVehicle() {
    const ADDUSER_URL = `${QRY_URL}/get-all`;
    const result = await axios.get(ADDUSER_URL);
    return result.data;
};

export async function insertVehicle(payload) {
    const ADDUSER_URL = `${QRY_URL}/insert`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
};

export async function updateVehicle(id,payload) {
    const ADDUSER_URL = `${QRY_URL}/update/${id}`;
    const result = await axios.put(ADDUSER_URL, payload);
    return result.data;
};

export async function deleteVehicleObj(id) {
    const ADDUSER_URL = `${QRY_URL}/delete/${id}`;
    const result = await axios.delete(ADDUSER_URL);
    return result.data;
};

export async function addDriver(id, payload){
    const ADDUSER_URL = `${QRY_URL}/add-driver/${id}`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
}

export async function addVehicle (id, payload){
    const ADDUSER_URL = `${QRY_URL}/add-vehicle/${id}`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;

}

export async function addRegion (id, payload){
    const ADDUSER_URL = `${QRY_URL}/add-region/${id}`;
    const result = await axios.post(ADDUSER_URL, payload);
    return result.data;
}

export async function deleteDriver(vehicleId,driverId){
    const ADDUSER_URL = `${QRY_URL}/delete-driver/${vehicleId}/${driverId}`;
    const result = await axios.post(ADDUSER_URL);
    return result.data;
}

export async function deleteVehicle(vehicleId,vEntryId){
    const ADDUSER_URL = `${QRY_URL}/delete-vehicle/${vehicleId}/${vEntryId}`;
    const result = await axios.post(ADDUSER_URL);
    return result.data;
}

export async function deleteRegion(vehicleId,regionId){
    const ADDUSER_URL = `${QRY_URL}/delete-region/${vehicleId}/${regionId}`;
    const result = await axios.post(ADDUSER_URL);
    return result.data;
}