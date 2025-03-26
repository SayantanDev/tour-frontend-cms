import React from 'react';
import {createRoot} from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, persistor } from './reduxcomponents/store';
import { PersistGate } from 'redux-persist/integration/react';
import './assets/index.scss';
import App from './App';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
       <App />
     </PersistGate>
   </Provider>, 
);
