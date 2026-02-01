import { Box, Button, Card, CardContent, Divider, Grid, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useParams } from "react-router-dom";
import { getAllPackages, getPackagesByLocation } from "../../api/packageAPI";
import { getSinglePlace, UpdatePlacesPacakges } from "../../api/placeApi";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const PackageUploadInPlaces = () => {

  const { id } = useParams();
  const [singleData, setsingleData] = useState({});
  const [locationData, setLocationData] = useState([]);
  const [pkgData, setPkgData] = useState([]);
  const [packageIds, setPackageIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInfo, setSearchInfo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSinglePlace(id);
      setsingleData(res);
      setPackageIds(res.details.packages.package_ids);
      console.log("this is my data", res);

      if (res.zone) {
        const locationData = await getPackagesByLocation(res.zone);
        console.log("this is my location", locationData.data);
        setLocationData(locationData.data);
      }

      const allPackages = await getAllPackages();
      setPkgData(allPackages.data);
      console.log("this is packages", allPackages.data);


    };
    fetchData();
  }, [id]);

  const handleAdd = async (packageId) => {
    setPackageIds((prev) => [...prev, packageId]);
    console.log(packageId);
    const obj = {
      "add": [packageId],
    }

    if (packageId) {
      await UpdatePlacesPacakges(id, obj);
    }
    console.log(obj);

  };

  const handleRemove = async (packageId) => {
    setPackageIds((prev) => prev.filter((id) => id !== packageId));
    const obj = {
      "remove": [packageId],
    }

    if (packageId) {

      await UpdatePlacesPacakges(id, obj);
    }
    console.log(obj);

  }

  const finalPackages = pkgData.filter((singlePackage) => packageIds.includes(singlePackage._id));

  console.log("finalPackages : ", finalPackages);

  const filterPackage = locationData.filter((data) => {
    return data.label.toLowerCase().includes(searchTerm.toLowerCase())
  });


  console.log(filterPackage);

  const filteredDestinationPkgs = finalPackages.filter((data) => {
    return data.label.toLowerCase().includes(searchInfo.toLowerCase())
  });

  // Column definitions for Preferred Packages table
  const preferredPackagesColumns = useMemo(() => [
    {
      accessorKey: "label",
      header: "Package Name",
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ getValue }) => {
        const duration = getValue();
        return `${duration - 1}N ${duration}D`;
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const singlePackage = row.original;
        const isIncluded = packageIds.includes(singlePackage._id);
        return (
          isIncluded ? (
            <Button variant="contained" color="error" onClick={() => handleRemove(singlePackage._id)}>
              <DeleteIcon />
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={() => handleAdd(singlePackage._id)}>
              <AddIcon />
            </Button>
          )
        );
      },
    },
  ], [packageIds, handleAdd, handleRemove]);

  // Column definitions for Updated Packages table
  const updatedPackagesColumns = useMemo(() => [
    {
      accessorKey: "label",
      header: "Package Name",
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ getValue }) => {
        const duration = getValue();
        return `${duration - 1}N ${duration}D`;
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const pkg = row.original;
        return (
          <Button variant="contained" color="error" onClick={() => handleRemove(pkg._id)}>
            <DeleteIcon />
          </Button>
        );
      },
    },
  ], [handleRemove]);

  // Table instances
  const preferredPackagesTable = useReactTable({
    data: filterPackage,
    columns: preferredPackagesColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id,
  });

  const updatedPackagesTable = useReactTable({
    data: filteredDestinationPkgs,
    columns: updatedPackagesColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id,
  });

  return (
    <>
      <Box display="flex" justifyContent="center">
        <Box m={4} display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Typography variant="h3" fontWeight="bold" sx={{ transform: "translateX(-40px)" }}>
            {singleData.name}
          </Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ transform: "translateX(-30px)" }}>Add/Update Packages</Typography>
        </Box>

      </Box>
      <Grid container gap={5} alignItems="stretch">
        <Grid item xs={5}>
          <Card sx={{ width: "100%", mb: 4, display: 'flex', flexDirection: "column", alignItems: "stretch" }}>

            <Typography variant="h5" fontWeight="bold" align="center" sx={{ mt: 2, mb: 2 }}>Preferred Packages</Typography>



            <TextField
              sx={{ mx: 2 }}
              label="Search Packages"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}

            />



            <CardContent sx={{ flexGrow: 1 }}>
              <Table>
                <TableHead>
                  {preferredPackagesTable.getHeaderGroups().map(headerGroup => (
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
                  {preferredPackagesTable.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={preferredPackagesColumns.length} align="center">
                        No Data Found
                      </TableCell>
                    </TableRow>
                  ) : (
                    preferredPackagesTable.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Divider orientation="vertical" variant="middle" flexItem />

        <Grid item xs={5}>
          <Card sx={{ width: "100%", mb: 4, display: 'flex', flexDirection: "column", alignItems: "stretch" }}>

            <Typography variant="h5" fontWeight="bold" align="center" sx={{ mt: 2, mb: 2 }}>Updated Packages</Typography>
            <TextField
              sx={{ mx: 2 }}
              label="Search Packages"
              variant="outlined"
              size="small"
              value={searchInfo}
              onChange={(e) => setSearchInfo(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Table>
                <TableHead>
                  {updatedPackagesTable.getHeaderGroups().map(headerGroup => (
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
                  {updatedPackagesTable.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={updatedPackagesColumns.length} align="center">
                        No Data Found
                      </TableCell>
                    </TableRow>
                  ) : (
                    updatedPackagesTable.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};


export default PackageUploadInPlaces;
