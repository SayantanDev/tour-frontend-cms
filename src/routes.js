import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import RootLayout from "./components/layout/RootLayout";
import Login from "./pages/login";
import Logout from "./pages/logout";
import ProtectedRoute from "./components/ProtectedRoute";
import AllPackages from "./pages/allPackages";
import Hotels from "./pages/hotels";
import Vehicles from "./pages/vehicle";
import Users from "./pages/users";
import Dashboard from "./pages/dashboard";
import Query from "./pages/query";
import Itinerary from "./pages/itinerary";
import AdditionalCost from "./pages/additionalCost";
import CreateItinerary from "./pages/createItinerary";
import withAuthRedirect from "./components/withAuthRedirect";
import View from "./components/packages/View";
import Edit from "./components/packages/Edit";
import NotAuthorized from "./pages/NotAuthorized";
import SingleQueriesView from "./pages/query/SingleQueriesView";
const RootLayoutWithRedirect = withAuthRedirect(RootLayout);

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RootLayoutWithRedirect />}>
          <Route index element={<Login />} />
          <Route path="/logout" element={<Logout />} />
        </Route>

        {/* Protected routes */}
        <Route path="/" element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute Element={Dashboard} module="dashboard" />} />
          <Route path="/query" element={<ProtectedRoute Element={Query} module="queries" />} />
          <Route path="/inquiry" element={<ProtectedRoute Element={Itinerary} module="inquiry" />} />
          <Route path="/createItinerary" element={<ProtectedRoute Element={CreateItinerary} module="itinerary" />} />
          <Route path="/packages" element={<ProtectedRoute Element={AllPackages} module="packages" />} />
          <Route path="/hotels" element={<ProtectedRoute Element={Hotels} module="hotels" />} />
          <Route path="/Vehicles" element={<ProtectedRoute Element={Vehicles} module="Vehicles" />} />
          <Route path="/packages/view/:id" element={<ProtectedRoute Element={View} module="packages" />} />
          <Route path="/query/view" element={<ProtectedRoute Element={SingleQueriesView}  />} />
          <Route path="/packages/edit" element={<ProtectedRoute Element={Edit} module="packages" />} />
          <Route path="/costTable" element={<ProtectedRoute Element={AdditionalCost} module="costs" />} />
          <Route path="/users" element={<ProtectedRoute Element={Users} module="user" />} />
          {/* Access Denied Page */}
          <Route path="/not-authorized" element={<NotAuthorized />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
