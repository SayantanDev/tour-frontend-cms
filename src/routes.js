import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import RootLayout from './components/layout/RootLayout';
import Login from './pages/login';
import Logout from './pages/logout';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppSender from './components/WhatsAppSender';
import AllPackages from './pages/allPackages';
import Users from './pages/users';
import Dashboard from './pages/dashboard';
import Query from './pages/query';
import Itinerary from './pages/itinerary';
import AdditionalCost from './pages/additionalCost';
import CreateItinerary from './pages/createItinerary';
import withAuthRedirect from './components/withAuthRedirect';
import View from './components/packages/View';
import Edit from './components/packages/Edit';

const RootLayoutWithRedirect = withAuthRedirect(RootLayout);

const Router = () => {
  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public routes, for all the pages before login */}
        <Route path="/" element={<RootLayoutWithRedirect />}>
          <Route index element={<Login />} />
          <Route path="/logout" element={<Logout />} />
        </Route>

        {/* Protected routes, for all the pages after login */}
        <Route path="/" element={<Layout />}>
          <Route
            path="/dashboard"
            element={<ProtectedRoute Element={Dashboard} />}
          />
          <Route
            path="/query"
            element={<ProtectedRoute Element={Query} />}
          />
          <Route
            path="/inquiry"
            element={<ProtectedRoute Element={Itinerary} />}
          />
          {/* <Route
            path="/itinerary"
            element={<ProtectedRoute Element={WhatsAppSender} />}
          /> */}
          <Route
            path="/createItinerary"
            element={<ProtectedRoute Element={CreateItinerary} />}
          />
          <Route
            path="/packages"
            element={<ProtectedRoute Element={AllPackages} />}
          />
          <Route
            path="/packages/view/:id"
            element={<ProtectedRoute Element={View} />}
          />
          <Route
            path="/packages/edit"
            element={<ProtectedRoute Element={Edit} />}
          />
          <Route
            path="/costTable"
            element={<ProtectedRoute Element={AdditionalCost} />}
          />
          <Route
            path="/users"
            element={<ProtectedRoute Element={Users} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
