import React, { useState } from "react";
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
                <TableRow>
                  <TableCell>Persons</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  {getPermission('packages', 'delete') && <TableCell>Action</TableCell>}

                </TableRow>
              </TableHead>
              <TableBody>
                {costDialogdata?.multipleCost?.length > 0 ? (
                  costDialogdata.multipleCost.map((data, index) => (
                    <>
                      {data.Pricing.map((priceData, priceIndex) => (
                        <TableRow key={`${data.Persons}-${priceData.Category}-${priceIndex}`}>
                          {getPermission('packages', 'alter-cell') ? (
                            priceIndex === 0 && (
                              <TableCell rowSpan={data.Pricing.length + (newRows[data.Persons] ? 1 : 0)}>
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
                              </TableCell>
                            )
                          ) : (
                            priceIndex === 0 && (
                              <TableCell rowSpan={data.Pricing.length + (newRows[data.Persons] ? 1 : 0)}>{data.Persons}</TableCell>
                            ))}


                          {/* CATEGORY */}
                          {getPermission('packages', 'alter-inline') ? 
                          <TableCell onDoubleClick={() => setEditCell({ section: "multiple", rowIndex: index, priceIndex, field: "Category" })}>
                            {editCell.rowIndex === index && editCell.priceIndex === priceIndex && editCell.field === "Category" ? (
                              <TextField
                                variant="standard"
                                value={priceData.Category}
                                onChange={(e) => handleEditChange("multiple", index, priceIndex, "Category", e.target.value)}
                                onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                                onKeyDown={handleEditKeyDown}
                                autoFocus
                                size="small"
                              />
                            ) : priceData.Category}
                          </TableCell> :
                          <TableCell>{priceData.Category}</TableCell>}

                          {/* PRICE */}
                          {getPermission('packages', 'alter-inline') ? 
                          <TableCell onDoubleClick={() => setEditCell({ section: "multiple", rowIndex: index, priceIndex, field: "Price" })}>
                            {editCell.rowIndex === index && editCell.priceIndex === priceIndex && editCell.field === "Price" ? (
                              <TextField
                                variant="standard"
                                value={priceData.Price}
                                onChange={(e) => handleEditChange("multiple", index, priceIndex, "Price", e.target.value)}
                                onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                                onKeyDown={handleEditKeyDown}
                                autoFocus
                                size="small"
                              />
                            ) : `₹ ${priceData.Price}`}
                            </TableCell> : <TableCell> ₹ {priceData.Price}</TableCell>}

                          {/* DELETE */}
                          {getPermission('packages', 'delete') &&
                            <TableCell>
                              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleOpenCatConfirm(priceData.Category, "multiple", priceIndex, index); }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          }
                        </TableRow>
                      ))}

                      {/* INLINE NEW ROW */}
                      {newRows["multiple"]?.[data.Persons] && (
                        <TableRow key={`new-${data.Persons}`}>
                          <TableCell />
                          <TableCell>
                            <TextField
                              placeholder="Category"
                              value={newRows["multiple"][data.Persons].Category}
                              onChange={(e) => handleNewRowChange("multiple", data.Persons, "Category", e.target.value)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              placeholder="Price"
                              value={newRows["multiple"][data.Persons].Price}
                              onChange={(e) => handleNewRowChange("multiple", data.Persons, "Price", e.target.value)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="contained" onClick={() => handleSaveNewRow("multiple", data.Persons)}>Save</Button>
                            <Button size="small" onClick={() => handleCancelNewRow("multiple", data.Persons)}>Cancel</Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No data available</TableCell>
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
                <TableRow>
                  <TableCell>Days</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  {getPermission('packages', 'delete') && <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {costDialogdata?.daysCost?.length > 0 ? (
                  costDialogdata.daysCost.map((data, index) =>
                    data.Pricing.map((priceData, priceIndex) => (
                      <>
                        <TableRow key={`${data.Days}-${priceData.Category}-${priceIndex}`}>
                          {getPermission('packages', 'alter-cell') ?
                            (priceIndex === 0 && (
                              <TableCell rowSpan={data.Pricing.length + (newRows[data.Days] ? 1 : 0)}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography>{data.Days}</Typography>
                                  <IconButton size="small" color="error" onClick={() => handleOpenConfirm("days", data.Days)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="success" onClick={() => handleAddClick("days", data.Days)}>
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            )) : (priceIndex === 0 && (
                              <TableCell rowSpan={data.Pricing.length + (newRows[data.Days] ? 1 : 0)}>{data.Days}</TableCell>
                            ))}

                          {/* Category Cell */}
                          {getPermission('packages', 'alter-inline') ? 
                          <TableCell onDoubleClick={() => setEditCell({ section: "days", rowIndex: index, priceIndex, field: "Category" })}>
                            {editCell.section === "days" && editCell.rowIndex === index && editCell.priceIndex === priceIndex && editCell.field === "Category" ? (
                              <TextField
                                variant="standard"
                                value={priceData.Category}
                                onChange={(e) => handleEditChange("days", index, priceIndex, "Category", e.target.value)}
                                onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                                onKeyDown={handleEditKeyDown}
                                autoFocus
                                size="small"
                              />
                            ) : priceData.Category}
                          </TableCell> : <TableCell>{priceData.Category}</TableCell>}

                          {/* Price Cell */}
                          {getPermission('packages', 'alter-inline') ? 
                          <TableCell onDoubleClick={() => setEditCell({ section: "days", rowIndex: index, priceIndex, field: "Price" })}>
                            {editCell.rowIndex === index && editCell.priceIndex === priceIndex && editCell.field === "Price" ? (
                              <TextField
                                variant="standard"
                                value={priceData.Price}
                                onChange={(e) => handleEditChange("days", index, priceIndex, "Price", e.target.value)}
                                onBlur={() => setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })}
                                onKeyDown={handleEditKeyDown}
                                autoFocus
                                size="small"
                              />
                            ) : `₹ ${priceData.Price}`}
                          </TableCell> : <TableCell>₹ {priceData.Price}</TableCell>}
                          {/* DELETE */}
                          {getPermission('packages', 'delete') &&
                            <TableCell>
                              <IconButton size="small" color="error" onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCatConfirm(priceData.Category, "days", priceIndex, index);
                              }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          }



                        </TableRow>
                        {/* INLINE NEW ROW */}
                        {priceIndex === data.Pricing.length - 1 && newRows["days"]?.[data.Days] && (
                          <TableRow key={`new-${data.Days}`}>
                            <TableCell />
                            <TableCell>
                              <TextField
                                placeholder="Category"
                                value={newRows["days"][data.Days].Category}
                                onChange={(e) => handleNewRowChange("days", data.Days, "Category", e.target.value)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                placeholder="Price"
                                value={newRows["days"][data.Days].Price}
                                onChange={(e) => handleNewRowChange("days", data.Days, "Price", e.target.value)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="contained" onClick={() => handleSaveNewRow("days", data.Days)}>Save</Button>
                              <Button size="small" onClick={() => handleCancelNewRow("days", data.Days)}>Cancel</Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No data available</TableCell>
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
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  {getPermission('packages', 'alter-cell') &&
                    <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              {/* VALUE COST TABLE */}
              <TableBody>
                {costDialogdata.valueCost?.map((item, index) => (
                  <TableRow key={index}>

                    {/* Type */}
                    {getPermission('packages', 'alter-inline') ?
                    <TableCell
                      onDoubleClick={() =>
                        setEditCell({ section: "value", rowIndex: index, priceIndex: null, field: "Type" })
                      }
                    >
                      {editCell.section === "value" &&
                        editCell.rowIndex === index &&
                        editCell.field === "Type" ? (
                        <TextField
                          variant="standard"
                          value={item.Type}
                          onChange={(e) => handleEditChange("value", index, null, "Type", e.target.value)}
                          onBlur={() =>
                            setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })
                          }
                          autoFocus
                          size="small"
                        />
                      ) : (
                        item.Type
                      )}
                    </TableCell> : <TableCell>{item.Type}</TableCell>}

                    {/* Price */}
                    {getPermission('packages', 'alter-inline') ? 
                    <TableCell
                      onDoubleClick={() =>
                        setEditCell({ section: "value", rowIndex: index, priceIndex: null, field: "Price" })
                      }
                    >
                      {editCell.section === "value" &&
                        editCell.rowIndex === index &&
                        editCell.field === "Price" ? (
                        <TextField
                          variant="standard"
                          value={item.Price}
                          onChange={(e) => handleEditChange("value", index, null, "Price", e.target.value)}
                          onBlur={() =>
                            setEditCell({ section: "", rowIndex: null, priceIndex: null, field: "" })
                          }
                          autoFocus
                          size="small"
                        />
                      ) : `₹ ${item.Price}`}
                    </TableCell> : <TableCell>₹ {item.Price}</TableCell>}

                    {/* Action */}
                    {getPermission('packages', 'alter-cell') &&
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenConfirm("value", item.Type)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="success" onClick={() => handleAddClick("value")}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    }
                  </TableRow>
                ))}

                {/* INLINE ADD NEW ROW */}
                {newRows["value"] && (
                  <TableRow key="new-value">
                    <TableCell>
                      <TextField
                        placeholder="Type"
                        value={newRows["value"].Type} // or rename to Type if you prefer
                        onChange={(e) => handleNewRowChange("value", "value", "Category", e.target.value)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        placeholder="Price"
                        value={newRows["value"].Price}
                        onChange={(e) => handleNewRowChange("value", "value", "Price", e.target.value)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" onClick={() => handleSaveNewRow("value", "value")}>
                        Save
                      </Button>
                      <Button size="small" onClick={() => handleCancelNewRow("value", "value")}>
                        Cancel
                      </Button>
                    </TableCell>
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
