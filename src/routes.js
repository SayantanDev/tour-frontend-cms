import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

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
import PackageCreate from "./components/packages/packageForm";
import PlacesForm from "./components/places/placesForm";
import CtgForm from "./components/category-packages/ctgForm";
import AllPlaces from "./pages/allPlaces";
import CategoryPackage from "./pages/categoryPackage";
import ImageManagerPage from "./pages/imageManager";
import PackageUploadInPlaces from "./pages/packageUpload/inPlaces";
import CategoryPackageUploadInPlaces from "./pages/packageUpload/inCategoryPackage";
import AllPermissions from "./pages/allPermissions";
import AllUserPermissions from "./pages/allUserPermissions";
import Profile from "./pages/Profile";

const RootLayoutWithRedirect = withAuthRedirect(RootLayout);

// Create routes using React Router v6.15+ with future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route path="/" element={<RootLayoutWithRedirect />}>
        <Route index element={<Login />} />
        <Route path="logout" element={<Logout />} />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<Layout />}>
        <Route
          path="dashboard"
          element={<ProtectedRoute Element={Dashboard} module="dashboard" />}
        />
        <Route
          path="query"
          element={<ProtectedRoute Element={Query} module="queries" />}
        />
        <Route
          path="inquiry"
          element={<ProtectedRoute Element={Itinerary} module="inquiry" />}
        />
        <Route
          path="createItinerary"
          element={<ProtectedRoute Element={CreateItinerary} module="inquiry" />}
        />
        <Route
          path="packages"
          element={<ProtectedRoute Element={AllPackages} module="packages" />}
        />
        <Route
          path="profile"
          element={<ProtectedRoute Element={Profile} module="packages" />}
        />
        <Route
          path="hotels" 
          element={<ProtectedRoute Element={Hotels} module="hotel" />}
        />
        <Route
          path="Vehicles"
          element={<ProtectedRoute Element={Vehicles} module="Vehicles" />}
        />
        <Route
          path="packages/view/:id"
          element={<ProtectedRoute Element={View} module="packages" />}
        />
        <Route
          path="packages/createandedit"
          element={<ProtectedRoute Element={PackageCreate} module="packages" />}
        />
        <Route
          path="category-packages/createandedit"
          element={<ProtectedRoute Element={CtgForm} module="packages" />}
        />
        <Route
          path="category-packages/view"
          element={<ProtectedRoute Element={CategoryPackage} module="packages" />}
        />
        <Route
          path="upload/categorypackages/:id"
          element={<ProtectedRoute Element={CategoryPackageUploadInPlaces} module="places" />}
        />
        <Route
          path="places/createandedit"
          element={<ProtectedRoute Element={PlacesForm} module="places" />}
        />
        <Route
          path="places/view"
          element={<ProtectedRoute Element={AllPlaces} module="places" />}
        />
        <Route
          path="upload/:schema/:id"
          element={<ProtectedRoute Element={ImageManagerPage} module="places" />}
        />
        <Route
          path="upload/packages/:id"
          element={<ProtectedRoute Element={PackageUploadInPlaces} module="places" />}
        />
        <Route
          path="query/view"
          element={<ProtectedRoute Element={SingleQueriesView} module="queries" />}
        />
        <Route
          path="packages/edit"
          element={<ProtectedRoute Element={Edit} module="packages" />}
        />
        <Route
          path="costTable"
          element={<ProtectedRoute Element={AdditionalCost} module="costs" />}
        />
        <Route
          path="users"
          element={<ProtectedRoute Element={Users} module="user" />}
        />
        <Route
          path="permission"
          element={<ProtectedRoute Element={AllPermissions} module="permission" />}
        />
        <Route
          path="user-permission"
          element={<ProtectedRoute Element={AllUserPermissions} module="user-permission" />}
        />
        <Route path="not-authorized" element={<NotAuthorized />} />
      </Route>
    </>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

// Provide the router
const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
