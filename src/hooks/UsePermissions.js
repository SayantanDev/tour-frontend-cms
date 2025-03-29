import { useCallback } from "react";
import { useSelector } from "react-redux";

const userPermission = [
  { role: "Admin", permissions: "all" },
  {
    role: "Admin-a",
    permissions: [
      { module: "inquiry", value: ["view", "create", "alter", "delete"] },
      { module: "user", value: ["view", "create", "alter", "delete"] },
      { module: "queries", value: ["view", "create", "alter", "delete"] },
    ],
  },
  {
    role: "FrontDesk",
    permissions: [
      { module: "inquiry", value: ["view"] },
      { module: "queries", value: ["view", "create"] },
      { module: "dashboard", value: ["view"] },
    ],
  },
];

const usePermissions = () => {
  const userRole = "Admin"; // Replace with: useSelector((state) => state.user.role);

  return useCallback(
    (moduleName, permissionType) => {
      // console.log("moduleName:", moduleName, "permissionType:", permissionType);
      
      const roleData = userPermission.find((role) => role.role === userRole);
      if (!roleData) return false;

      if (roleData.permissions === "all") return true;

      const modulePermissions = roleData.permissions.find((mod) => mod.module === moduleName);
      if (!modulePermissions) return false;

      return modulePermissions.value.includes(permissionType);
    },
    [userRole] // Dependencies
  );
};

export default usePermissions;
