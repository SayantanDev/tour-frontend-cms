import React, { useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    Chip,
} from '@mui/material';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useSelector } from "react-redux";

// Reusable table component using @tanstack/react-table
const DataTable = ({ data, title, columns }) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                {title}
            </Typography>
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableCell
                                        key={header.id}
                                        sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} hover>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

// Component for property-value tables
const PropertyValueTable = ({ data, title }) => {
    const entries = Object.entries(data);
    const columns = useMemo(() => [
        {
            accessorKey: 'property',
            header: 'Property',
            cell: ({ row }) => (
                <Box sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                    {row.original.property.replace(/_/g, ' ')}
                </Box>
            ),
        },
        {
            accessorKey: 'value',
            header: 'Value',
            cell: ({ getValue }) => {
                const value = getValue();
                return typeof value === 'object'
                    ? <Chip label="Object/Array" size="small" color="info" />
                    : value?.toString() || 'N/A';
            },
        },
    ], []);

    const tableData = useMemo(() => 
        entries.map(([key, value]) => ({
            property: key,
            value,
        }))
    , [entries]);

    return <DataTable data={tableData} title={title} columns={columns} />;
};

// Component for inclusions/exclusions tables
const ListTable = ({ data, title }) => {
    const columns = useMemo(() => [
        {
            accessorKey: 'index',
            header: '#',
            cell: ({ row }) => row.original.index,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ getValue }) => getValue()?.toString() || 'N/A',
        },
    ], []);

    const tableData = useMemo(() => 
        data.map((item, index) => ({
            index,
            description: item,
        }))
    , [data]);

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                {title}
            </Typography>
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableCell
                                        key={header.id}
                                        sx={{ 
                                            fontWeight: 600,
                                            width: header.id === 'index' ? '60px' : 'auto'
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} hover>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

const AdditionalCost = () => {
    const configData = useSelector((state) => state.config.configData);

    // Helper component to render tables for nested objects
    const RenderDataTable = ({ data, title }) => {
        // Compute headers and columns at top level (hooks must be called unconditionally)
        const isArray = Array.isArray(data) && data.length > 0;
        const headers = isArray ? Object.keys(data[0]) : [];
        const headersKey = headers.join(',');
        
        const arrayColumns = useMemo(() => 
            headers.map(header => ({
                accessorKey: header,
                header: header.replace(/_/g, ' '),
                cell: ({ getValue }) => {
                    const value = getValue();
                    return typeof value === 'object'
                        ? JSON.stringify(value)
                        : value?.toString() || 'N/A';
                },
            }))
        , [headersKey]); // Use stable string key as dependency

        if (!data || (Array.isArray(data) && data.length === 0)) {
            return null;
        }

        // Handle array of objects
        if (isArray) {
            return <DataTable data={data} title={title} columns={arrayColumns} />;
        }

        // Handle object with properties
        if (typeof data === 'object' && !Array.isArray(data)) {
            return <PropertyValueTable data={data} title={title} />;
        }

        return null;
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Additional Costs Section */}
            {configData?.additionalCosts && (
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 45%', minWidth: '400px' }}>
                            <RenderDataTable data={configData.additionalCosts.car} title="Car Types" />
                        </Box>
                        <Box sx={{ flex: '1 1 45%', minWidth: '400px' }}>
                            <RenderDataTable data={configData.additionalCosts.hotel} title="Hotel Types" />
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Render all other top-level properties */}
            {Object.entries(configData || {}).map(([key, value]) => {
                // Skip certain properties (case-insensitive)
                const keyLower = key.toLowerCase();
                const skipKeys = ['additionalcosts', 'navigationstrings', 'userpermission'];
                if (skipKeys.includes(keyLower)) return null;

                // Special handling for COMMONREACH
                if (keyLower === 'commonreach' && typeof value === 'object' && !Array.isArray(value)) {
                    const { inclusions, exclusions, ...restProps } = value;

                    return (
                        <Box key={key} sx={{ mb: 4 }}>
                            {/* Main COMMONREACH properties (excluding inclusions/exclusions) */}
                            {Object.keys(restProps).length > 0 && (
                                <PropertyValueTable data={restProps} title="Common Reach Properties" />
                            )}

                            {/* Inclusions and Exclusions Tables - Side by Side */}
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, flexWrap: 'wrap' }}>
                                {/* Inclusions Table */}
                                {inclusions && Array.isArray(inclusions) && inclusions.length > 0 && (
                                    <Box sx={{ flex: '1 1 45%', minWidth: '400px' }}>
                                        <ListTable data={inclusions} title="Inclusions" />
                                    </Box>
                                )}

                                {/* Exclusions Table */}
                                {exclusions && Array.isArray(exclusions) && exclusions.length > 0 && (
                                    <Box sx={{ flex: '1 1 45%', minWidth: '400px' }}>
                                        <ListTable data={exclusions} title="Exclusions" />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    );
                }


                return (
                    <Box key={key}>
                        <RenderDataTable data={value} title={key.replace(/_/g, ' ').toUpperCase()} />
                    </Box>
                );
            })}

            {/* Empty State */}
            {(!configData || Object.keys(configData).length === 0) && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No configuration data available
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}

export default AdditionalCost;