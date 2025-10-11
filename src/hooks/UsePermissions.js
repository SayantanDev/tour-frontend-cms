// hooks/usePermissions.js
import { useCallback } from "react";
import { useSelector } from "react-redux";

const userPermissionData = [
  { role: "Admin", permissions: "all" },
  {
    role: "Admin-a",
    permissions: [
      { module: "inquiry", value: ["view", "create", "alter", "delete"] },
      { module: "user", value: ["view", "create", "alter", "delete"] },
      { module: "queries", value: ["view", "create", "alter", "delete", "assuser"] },
      { module: "operation", value: ["view", "create", "alter", "delete", "change-request", "verify"] },
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
  {
    role: "User",
    permissions: [
      { module: "inquiry", value: ["view"] },
      { module: "queries", value: ["view", "create"] },
      { module: "dashboard", value: ["view"] },
      { module: "logout", value: ["view"] },
      { module: "operation", value: ["changeRequest"] },
    ],
  },
  {
    role: "EsoOperator",
    permissions: [
      { module: "dashboard", value: ["view"] },
      { module: "packages", value: ["view", "create", "alter"] },
      { module: "ctg-packages", value: ["view", "create", "alter", "delete"] },
      { module: "logout", value: ["view"] },
      { module: "places", value: ["view"] },
      { module: "hotel", value: ["view", "alter"] },
    ],
  },
];

const usePermissions = () => {
  const userRole = useSelector((state) => state.tokens.user.permission);

  return useCallback(
    (moduleName, permissionType) => {
      const roleData = userPermissionData.find((role) => role.role === userRole);
      if (!roleData) return false;
      if (roleData.permissions === "all") return true;

      const modulePermissions = roleData.permissions.find((mod) => mod.module === moduleName);
      return modulePermissions?.value.includes(permissionType) || false;
    },
    [userRole]
  );
};

export default usePermissions;
