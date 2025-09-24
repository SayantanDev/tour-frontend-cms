import axios from './interceptor';

export const PKG_URL = `${process.env.REACT_APP_BASE_URL}/packages`;
// const PKG_URL = 'https://tour-backend-live.onrender.com/api/v1/packages';


export function getAllPackages() {
    const GETPKG_URL = `${PKG_URL}/getAll`;
    return axios.get(GETPKG_URL);
};

export function getSinglePackages(id) {
    const GETPKG_URL = `${PKG_URL}/getsingle/${id}`;
    return axios.get(GETPKG_URL);
};

export function addPackage(obj) {
    const ADDPKG_URL = `${PKG_URL}/addPackage`;
    return axios.post(ADDPKG_URL, obj);
};

export function createPackage(obj){
    const ADDPKG_URL = `${PKG_URL}/createPackage`;
    return axios.post(ADDPKG_URL, obj);
}

export function updatePackage(obj, pkgId) {
    const UPDATEPKG__URL = `${PKG_URL}/editPackage/${pkgId}`;
    return axios.put(UPDATEPKG__URL, obj);
};

export function deletePackage(pkgId) {
    const DELETEPKG__URL = `${PKG_URL}/deletePackage/${pkgId}`;
    return axios.delete(DELETEPKG__URL);
};

export function verifyPackage(id, obj) {
    const UPDATEPKG__URL = `${PKG_URL}/verify/${id}`;
    return axios.put(UPDATEPKG__URL, obj);
    
}

export function updatePackageRanking(id, obj) {
    const UPDATEPKG__URL = `${PKG_URL}/update/ranking/${id}`;
    return axios.put(UPDATEPKG__URL, obj);
    
}

export function getPackagesByLocation(location) {
    const UPDATEPKG__URL = `${PKG_URL}/getpackagesbylocation/${location}`;
    return axios.get(UPDATEPKG__URL);
}