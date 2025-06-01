
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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