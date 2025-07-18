import axios from './interceptor';

export const PKG_URL = `${process.env.REACT_APP_BASE_URL}/cat-package`;
// const PKG_URL = 'https://tour-backend-live.onrender.com/api/v1/packages';


export function getAllcatPackage() {
    const GETPKG_URL = `${PKG_URL}/get-all`;
    return axios.get(GETPKG_URL);
};

export function getSinglecatPackages(id) {
    const GETPKG_URL = `${PKG_URL}/get-single/${id}`;
    return axios.get(GETPKG_URL);
};
export function updateCatPackage(id, value) {
    const GETPKG_URL = `${PKG_URL}/update/${id}`;
    return axios.put(GETPKG_URL, value);
};
export function CatPackageCreate(obj) {
    const ADDPKG_URL = `${PKG_URL}/create`;
    return axios.post(ADDPKG_URL, obj);
};
