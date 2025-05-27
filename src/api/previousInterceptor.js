
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
// import { addLoginToken, removeLoginToken } from 'src/reduxcomponents/slices/tokenSlice';
// import { store } from 'src/reduxcomponents/store';

// const getToken = () => {
//     const state = store.getState();
//     const authToken = state?.tokens.tokens.token ? state?.tokens.tokens.token : '';
//     return authToken;
// };

// const getRefreshToken = () => {
//     const state = store.getState();
//     return state?.tokens.tokens.refreshToken;
// }

// axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';


export const setupAxios = () => {
    axios.interceptors.request.use(
        function (config) {
            delete config?.headers?.Authorization;
            // const token = getToken();
            const token = 'sdfhejehsdjehffjehfjehferhferj';
            if (token && token !== '') {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            if (config.url.includes('/addPackage') || config.url.includes('/editPackage')){
                config.headers['Content-Type'] = 'multipart/form-data';
            } else {
                config.headers['Content-Type'] = 'application/json';
            }
            return config;
        },
        function (error) {
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        async function (response) {
            return response;
        },
        async function (error) {
            return Promise.reject(error);
        }
    );
};

setupAxios();

export default axios;