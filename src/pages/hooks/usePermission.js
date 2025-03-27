import { useMemo } from "react";

const userPermission = [
    { role: 'Admin', permissions: 'all' },
    {
        role: 'Admin-a',
        permissions: [
            {
                module: 'inquriy',
                value : ['view', 'create', 'alter', 'delete']
            },
            {
                module: 'user',
                value : ['view', 'create', 'alter', 'delete']
            },
            {
                module: 'queries',
                value : ['view', 'create', 'alter', 'delete']
            }
        ]
    },
    {
        role: 'FrontDesk',
        permissions: [
            {
                module: 'inquriy',
                value : ['view']
            },
            {
                module: 'queries',
                value : ['view', 'create', 'alter']
            }
        ]
    },
   
];

const usePermission = (userRole, userName) => {
    const permissions = useMemo(() => {
        const roleData = userPermission.find(role => role.name === userRole && role.name === userName);

        if (!roleData) return {};

        if (roleData.role === 'all') {
            return { view: true, create: true, alter: true };
        }

        return {
            view: roleData.role.includes('view'),
            create: roleData.role.includes('create'),
            alter: roleData.role.includes('alter')
        };
    }, [userRole, userName]);

    return permissions;
};

export default usePermission;
