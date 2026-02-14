import React, { useState, useMemo } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import usePermissions from "../../hooks/UsePermissions";

const CostDialogbox = ({
  open,
  handleClose,
  costDialogdata,
  setCostDialogData,
  handleOpenConfirm,
  handleCloseConfirm,
  handleConfirmDelete,
  openConfirm,
}) => {
  const [editCell, setEditCell] = useState({ rowIndex: null, priceIndex: null, section: "", field: "" });
  const getPermission = usePermissions();



  // State to store which person has a new inline row being added
  const [newRows, setNewRows] = useState({
    multiple: null,
    days: null,
    value: null,
  });

  // === Handle Inline Editing for existing rows ===
  const handleEditChange = (section, rowIndex, priceIndex, field, value) => {
    const costKey =
      section === "multiple"
        ? "multipleCost"
        : section === "days"
          ? "daysCost"
          : "valueCost";
    const updated = { ...costDialogdata };
    if (section === "value") {
      // flat array
      updated[costKey][rowIndex][field] = value;
    } else {
      // nested structure
      updated[costKey][rowIndex].Pricing[priceIndex][field] = value;
    }
    setCostDialogData(updated);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") {
      setEditCell({ rowIndex: null, priceIndex: null, section: "", field: "" });
    }
  };

  // === Add a new inline row ===
  const handleAddClick = (section, target) => {
    if (section === 'value') {
      setNewRows(prev => ({ ...prev, [section]: { Type: "", Price: "" } }));
    } else {
      setNewRows(prev => ({
        ...prev,
        [section]: { ...prev[section], [target]: { Category: "", Price: "" } }
      }));
    }
  };

  const handleNewRowChange = (section, target, field, value) => {
    if (section === "value") {
      // Flat structure (no target nesting)
      setNewRows(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setNewRows(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [target]: { ...prev[section]?.[target], [field]: value }
        }
      }));
    }
  };

  const handleSaveNewRow = (section, target) => {
    const keyMap = { multiple: "multipleCost", days: "daysCost", value: "valueCost" };
    const costKey = keyMap[section];
    const updated = { ...costDialogdata };

    if (section === "value") {
      const newRow = newRows[section];
      if (!newRow?.Type || !newRow?.Price) return;
      // Direct push (flat structure)
      updated[costKey] = [...updated[costKey], { ...newRow }];
    } else {
      const newRow = newRows[section]?.[target];
      if (!newRow?.Category || !newRow?.Price) return;

      updated[costKey] = updated[costKey].map(item =>
        item.Persons === target || item.Days === target || item.Type === target
          ? { ...item, Pricing: [...item.Pricing, { ...newRow }] }
          : item
      );
    }

    setCostDialogData(updated);

    // Remove the inline new row after saving
    setNewRows(prev => {
      const copy = { ...prev };
      if (section === "value") {
        delete copy[section];
      } else if (copy[section]) {
        delete copy[section][target];
      }
      return copy;
    });
  };

  const handleCancelNewRow = (section, target) => {
    setNewRows(prev => {
      const copy = { ...prev };
      if (section === "value") {
        delete copy[section];
      } else if (copy[section]) {
        delete copy[section][target];
      }
      return copy;
    });
  };


  // === Delete category logic ===
  const [openCatConfirm, setOpenCatConfirm] = useState({ isVisible: false, section: "", cat: "", priceIndex: null });



  const handleOpenCatConfirm = (cat, section, priceIndex, parentIndex) => setOpenCatConfirm({ isVisible: true, section, cat, priceIndex, parentIndex });

  const handleCloseCatConfirm = () => setOpenCatConfirm({ isVisible: false, section: "", cat: "", priceIndex: null, parentIndex: null });

  const handleConfirmCatDelete = () => {
    const { section, parentIndex, priceIndex } = openCatConfirm;

    const updated = { ...costDialogdata };
    const keyMap = {
      multiple: "multipleCost",
      days: "daysCost",
      value: "valueCost",
    };
    const costKey = keyMap[section];
    if (!costKey) return;

    // remove only the specific item inside Pricing
    updated[costKey][parentIndex].Pricing = updated[costKey][parentIndex].Pricing.filter(
      (_, idx) => idx !== priceIndex
    );

    setCostDialogData(updated);
    handleCloseCatConfirm();
  };



  const type = openConfirm.section === "multiple" ? "Persons" : openConfirm.section === "days" ? "Days" : "Types";

  // Flatten multiple cost data for table
  const multipleCostData = useMemo(() => {
    if (!costDialogdata?.multipleCost?.length) return [];
    const flattened = [];
    costDialogdata.multipleCost.forEach((data, index) => {
      data.Pricing.forEach((priceData, priceIndex) => {
        flattened.push({
          id: `${data.Persons}-${priceData.Category}-${priceIndex}`,
          parentIndex: index,
          priceIndex,
          Persons: data.Persons,
          Category: priceData.Category,
          Price: priceData.Price,
          isFirstRow: priceIndex === 0,
          rowSpan: priceIndex === 0 ? data.Pricing.length + (newRows["multiple"]?.[data.Persons] ? 1 : 0) : 0,
        });
      });
      // Add new row if exists
      if (newRows["multiple"]?.[data.Persons]) {
        flattened.push({
          id: `new-${data.Persons}`,
          parentIndex: index,
          priceIndex: -1,
          Persons: data.Persons,
          Category: "",
          Price: "",
          isNewRow: true,
          isFirstRow: false,
          rowSpan: 0,
        });
      }
    });
    return flattened;
  }, [costDialogdata?.multipleCost, newRows]);

  // Flatten days cost data for table
  const daysCostData = useMemo(() => {
    if (!costDialogdata?.daysCost?.length) return [];
    const flattened = [];
    costDialogdata.daysCost.forEach((data, index) => {
      data.Pricing.forEach((priceData, priceIndex) => {
        flattened.push({
          id: `${data.Days}-${priceData.Category}-${priceIndex}`,
          parentIndex: index,
          priceIndex,
          Days: data.Days,
          Category: priceData.Category,
          Price: priceData.Price,
          isFirstRow: priceIndex === 0,
          rowSpan: priceIndex === 0 ? data.Pricing.length + (newRows["days"]?.[data.Days] ? 1 : 0) : 0,
        });
      });
      // Add new row if exists
      if (newRows["days"]?.[data.Days]) {
        flattened.push({
          id: `new-${data.Days}`,
          parentIndex: index,
          priceIndex: -1,
          Days: data.Days,
          Category: "",
          Price: "",
          isNewRow: true,
          isFirstRow: false,
          rowSpan: 0,
        });
      }
    });
    return flattened;
  }, [costDialogdata?.daysCost, newRows]);

  // Value cost data (already flat)
  const valueCostData = useMemo(() => {
    const data = costDialogdata?.valueCost || [];
    return data.map((item, index) => ({
      id: `value-${index}`,
      index,
      Type: item.Type,
      Price: item.Price,
    }));
  }, [costDialogdata?.valueCost]);

  // Multiple Cost columns
  const multipleCostColumns = useMemo(() => {
    const cols = [
      {
        accessorKey: "Persons",
        header: "Persons",
        cell: ({ row }) => {
          const data = row.original;
          if (data.isNewRow) return null;
          if (data.isFirstRow && data.rowSpan > 0) {
            return getPermission('packages', 'alter-cell') ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>{data.Persons}</Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleOpenConfirm("multiple", data.Persons)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleAddClick("multiple", data.Persons)}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : data.Persons;
          }
          return null;
        },
      },
      {
        accessorKey: "Category",
        header: "Category",
        cell: ({ row }) => {
          const data = row.original;
          if (data.isNewRow) {
            return (
              <TextField
                placeholder="Category"
                value={newRows["multiple"]?.[data.Persons]?.Category || ""}
                onChange={(e) => handleNewRowChange("multiple", data.Persons, "Category", e.target.value)}
                size="small"
              />
            );
          }
          if (getPermission('packages', 'alter-inline')) {
            return (
              <Box
                onDoubleClick={() => setEditCell({ section: "multiple", rowIndex: data.parentIndex, priceIndex: data.priceIndex, field: "Category" })}
                sx={{ cursor: 'text' }}
              >
                {editCell.rowIndex === data.parentIndex && editCell.priceIndex === data.priceIndex && editCell.field === "Category" ? (
                  <TextField
                    variant="standard"
                    value={data.Category}
                    onChange={(e) => handleEditChange("multiple", data.parentIndex, data.priceIndex, "Category", e.target.value)}
                    onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                    onKeyDown={handleEditKeyDown}
                    autoFocus
                    size="small"
                  />
                ) : data.Category}
              </Box>
            );
          }
          return data.Category;
        },
      },
      {
        accessorKey: "Price",
        header: "Price",
        cell: ({ row }) => {
          const data = row.original;
          if (data.isNewRow) {
            return (
              <TextField
                placeholder="Price"
                value={newRows["multiple"]?.[data.Persons]?.Price || ""}
                onChange={(e) => handleNewRowChange("multiple", data.Persons, "Price", e.target.value)}
                size="small"
              />
            );
          }
          if (getPermission('packages', 'alter-inline')) {
            return (
              <Box
                onDoubleClick={() => setEditCell({ section: "multiple", rowIndex: data.parentIndex, priceIndex: data.priceIndex, field: "Price" })}
                sx={{ cursor: 'text' }}
              >
                {editCell.rowIndex === data.parentIndex && editCell.priceIndex === data.priceIndex && editCell.field === "Price" ? (
                  <TextField
                    variant="standard"
                    value={data.Price}
                    onChange={(e) => handleEditChange("multiple", data.parentIndex, data.priceIndex, "Price", e.target.value)}
                    onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                    onKeyDown={handleEditKeyDown}
                    autoFocus
                    size="small"
                  />
                ) : `₹ ${data.Price}`}
              </Box>
            );
          }
          return `₹ ${data.Price}`;
        },
      },
    ];
    if (getPermission('packages', 'delete')) {
      cols.push({
        id: "action",
        header: "Action",
        cell: ({ row }) => {
          const data = row.original;
          if (data.isNewRow) {
            return (
              <Box>
                <Button size="small" variant="contained" onClick={() => handleSaveNewRow("multiple", data.Persons)}>Save</Button>
                <Button size="small" onClick={() => handleCancelNewRow("multiple", data.Persons)}>Cancel</Button>
              </Box>
            );
          }
          return (
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleOpenCatConfirm(data.Category, "multiple", data.priceIndex, data.parentIndex); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          );
        },
      });
    }
    return cols;
  }, [getPermission, editCell, newRows, handleEditChange, handleEditKeyDown, handleNewRowChange, handleSaveNewRow, handleCancelNewRow, handleOpenConfirm, handleAddClick, handleOpenCatConfirm]);

  // Multiple Cost table
  const multipleCostTable = useReactTable({
    data: multipleCostData,
    columns: multipleCostColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  // Days Cost columns
  const daysCostColumns = useMemo(() => {
    const cols = [
      {
        accessorKey: "Days",
        header: "Days",
        cell: ({ row }) => {
          const data = row.original;
          if (data.isNewRow) return null;
          if (data.isFirstRow && data.rowSpan > 0) {
            return getPermission('packages', 'alter-cell') ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>{data.Days}</Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleOpenConfirm("days", data.Days)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleAddClick("days", data.Days)}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : data.Days;
          }
          return null;
        },
      },
      {
        accessorKey: "Category",
        header: "Category",
        cell: ({ row }) => {
          const data = row.original;
          if (data.isNewRow) {
            return (
              <TextField
                placeholder="Category"
                value={newRows["days"]?.[data.Days]?.Category || ""}
                onChange={(e) => handleNewRowChange("days", data.Days, "Category", e.target.value)}
                size="small"
              />
            );
          }
          if (getPermission('packages', 'alter-inline')) {
            return (
              <Box
                onDoubleClick={() => setEditCell({ section: "days", rowIndex: data.parentIndex, priceIndex: data.priceIndex, field: "Category" })}
                sx={{ cursor: 'text' }}
              >
                {editCell.section === "days" && editCell.rowIndex === data.parentIndex && editCell.priceIndex === data.priceIndex && editCell.field === "Category" ? (
                  <TextField
                    variant="standard"
                    value={data.Category}
                    onChange={(e) => handleEditChange("days", data.parentIndex, data.priceIndex, "Category", e.target.value)}
                    onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                    onKeyDown={handleEditKeyDown}
                    autoFocus
                    size="small"
                  />
                ) : data.Category}
              </Box>
            );
          }
          return data.Category;
        },
      },
      {
        accessorKey: "Price",
        header: "Price",
        cell: ({ row }) => {
          const data = row.original;
          if (data.isNewRow) {
            return (
              <TextField
                placeholder="Price"
                value={newRows["days"]?.[data.Days]?.Price || ""}
                onChange={(e) => handleNewRowChange("days", data.Days, "Price", e.target.value)}
                size="small"
              />
            );
          }
          if (getPermission('packages', 'alter-inline')) {
            return (
              <Box
                onDoubleClick={() => setEditCell({ section: "days", rowIndex: data.parentIndex, priceIndex: data.priceIndex, field: "Price" })}
                sx={{ cursor: 'text' }}
              >
                {editCell.rowIndex === data.parentIndex && editCell.priceIndex === data.priceIndex && editCell.field === "Price" ? (
                  <TextField
                    variant="standard"
                    value={data.Price}
                    onChange={(e) => handleEditChange("days", data.parentIndex, data.priceIndex, "Price", e.target.value)}
                    onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                    onKeyDown={handleEditKeyDown}
                    autoFocus
                    size="small"
                  />
                ) : `₹ ${data.Price}`}
              </Box>
            );
          }
          return `₹ ${data.Price}`;
        },
      },
    ];
    if (getPermission('packages', 'delete')) {
      cols.push({
        id: "action",
        header: "Action",
        cell: ({ row }) => {
          const data = row.original;
          if (data.isNewRow) {
            return (
              <Box>
                <Button size="small" variant="contained" onClick={() => handleSaveNewRow("days", data.Days)}>Save</Button>
                <Button size="small" onClick={() => handleCancelNewRow("days", data.Days)}>Cancel</Button>
              </Box>
            );
          }
          return (
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleOpenCatConfirm(data.Category, "days", data.priceIndex, data.parentIndex); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          );
        },
      });
    }
    return cols;
  }, [getPermission, editCell, newRows, handleEditChange, handleEditKeyDown, handleNewRowChange, handleSaveNewRow, handleCancelNewRow, handleOpenConfirm, handleAddClick, handleOpenCatConfirm]);

  // Days Cost table
  const daysCostTable = useReactTable({
    data: daysCostData,
    columns: daysCostColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  // Value Cost columns
  const valueCostColumns = useMemo(() => {
    const cols = [
      {
        accessorKey: "Type",
        header: "Category",
        cell: ({ row }) => {
          const data = row.original;
          if (getPermission('packages', 'alter-inline')) {
            return (
              <Box
                onDoubleClick={() => setEditCell({ section: "value", rowIndex: data.index, priceIndex: null, field: "Type" })}
                sx={{ cursor: 'text' }}
              >
                {editCell.section === "value" && editCell.rowIndex === data.index && editCell.field === "Type" ? (
                  <TextField
                    variant="standard"
                    value={data.Type}
                    onChange={(e) => handleEditChange("value", data.index, null, "Type", e.target.value)}
                    onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                    autoFocus
                    size="small"
                  />
                ) : data.Type}
              </Box>
            );
          }
          return data.Type;
        },
      },
      {
        accessorKey: "Price",
        header: "Price",
        cell: ({ row }) => {
          const data = row.original;
          if (getPermission('packages', 'alter-inline')) {
            return (
              <Box
                onDoubleClick={() => setEditCell({ section: "value", rowIndex: data.index, priceIndex: null, field: "Price" })}
                sx={{ cursor: 'text' }}
              >
                {editCell.section === "value" && editCell.rowIndex === data.index && editCell.field === "Price" ? (
                  <TextField
                    variant="standard"
                    value={data.Price}
                    onChange={(e) => handleEditChange("value", data.index, null, "Price", e.target.value)}
                    onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                    autoFocus
                    size="small"
                  />
                ) : `₹ ${data.Price}`}
              </Box>
            );
          }
          return `₹ ${data.Price}`;
        },
      },
    ];
    if (getPermission('packages', 'alter-cell')) {
      cols.push({
        id: "action",
        header: "Action",
        cell: ({ row }) => {
          const data = row.original;
          const originalData = costDialogdata?.valueCost?.[data.index];
          return (
            <Box>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenConfirm("value", originalData?.Type)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="success" onClick={() => handleAddClick("value")}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        },
      });
    }
    return cols;
  }, [getPermission, editCell, costDialogdata, handleEditChange, handleOpenConfirm, handleAddClick]);

  // Value Cost table
  const valueCostTable = useReactTable({
    data: valueCostData,
    columns: valueCostColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>Cost Details</DialogTitle>
      <DialogContent>

        {/* SINGLE COST */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">Single Cost</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>₹ {costDialogdata?.singleCost || "Not available"}</Typography>
          </AccordionDetails>
        </Accordion>

        {/* MULTIPLE COST */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">Multiple Cost</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table>
              <TableHead>
                {multipleCostTable.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableCell key={header.id}>
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
                {multipleCostData.length > 0 ? (
                  multipleCostTable.getRowModel().rows.map((row) => {
                    const data = row.original;
                    const cells = row.getVisibleCells();
                    return (
                      <TableRow key={row.id}>
                        {cells.map((cell) => {
                          // Handle rowSpan for Persons column
                          if (cell.column.id === "Persons") {
                            if (data.isNewRow) {
                              return <TableCell key={cell.id} />;
                            }
                            if (data.isFirstRow && data.rowSpan > 0) {
                              return (
                                <TableCell
                                  key={cell.id}
                                  rowSpan={data.rowSpan}
                                  sx={{ verticalAlign: 'top' }}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              );
                            }
                            if (!data.isFirstRow) {
                              return null; // Skip rendering for non-first rows
                            }
                          }
                          return (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={multipleCostColumns.length} align="center">No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>

        {/* DAYS COST */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">Days Cost</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table>
              <TableHead>
                {daysCostTable.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableCell key={header.id}>
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
                {daysCostData.length > 0 ? (
                  daysCostTable.getRowModel().rows.map((row) => {
                    const data = row.original;
                    const cells = row.getVisibleCells();
                    return (
                      <TableRow key={row.id}>
                        {cells.map((cell) => {
                          // Handle rowSpan for Days column
                          if (cell.column.id === "Days") {
                            if (data.isNewRow) {
                              return <TableCell key={cell.id} />;
                            }
                            if (data.isFirstRow && data.rowSpan > 0) {
                              return (
                                <TableCell
                                  key={cell.id}
                                  rowSpan={data.rowSpan}
                                  sx={{ verticalAlign: 'top' }}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              );
                            }
                            if (!data.isFirstRow) {
                              return null; // Skip rendering for non-first rows
                            }
                          }
                          return (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={daysCostColumns.length} align="center">No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>

        {/* VALUE COST */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">Value Cost</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table>
              <TableHead>
                {valueCostTable.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableCell key={header.id}>
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
                {valueCostData.length > 0 ? (
                  <>
                    {valueCostTable.getRowModel().rows.map((row) => {
                      const data = row.original;
                      return (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                    {/* INLINE ADD NEW ROW */}
                    {newRows["value"] && (
                      <TableRow key="new-value">
                        <TableCell>
                          <TextField
                            placeholder="Type"
                            value={newRows["value"].Type || ""}
                            onChange={(e) => handleNewRowChange("value", "value", "Type", e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            placeholder="Price"
                            value={newRows["value"].Price || ""}
                            onChange={(e) => handleNewRowChange("value", "value", "Price", e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        {getPermission('packages', 'alter-cell') && (
                          <TableCell>
                            <Button size="small" variant="contained" onClick={() => handleSaveNewRow("value", "value")}>
                              Save
                            </Button>
                            <Button size="small" onClick={() => handleCancelNewRow("value", "value")}>
                              Cancel
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={valueCostColumns.length} align="center">No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </AccordionDetails>
        </Accordion>

        {/* DELETE CONFIRM */}
        <Dialog open={openConfirm.isVisible} onClose={handleCloseConfirm}>
          <DialogTitle>Are you sure you want to delete this entry for <b>{openConfirm.target}</b> {type}</DialogTitle>
          <DialogActions>
            <Button onClick={handleCloseConfirm} color="primary">Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">Confirm</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCatConfirm.isVisible} onClose={handleCloseCatConfirm}>
          <DialogTitle>Are you sure you want to delete this <b>{openCatConfirm.cat}</b> category?</DialogTitle>
          <DialogActions>
            <Button onClick={handleCloseCatConfirm} color="primary">Cancel</Button>
            <Button onClick={handleConfirmCatDelete} color="error" variant="contained">Confirm</Button>
          </DialogActions>
        </Dialog>

      </DialogContent>
    </Dialog>
  );
};

export default CostDialogbox;
