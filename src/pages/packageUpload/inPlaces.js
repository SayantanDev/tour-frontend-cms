import { Box, Button, Card, CardContent, Divider, Grid, InputAdornment, List, ListItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
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
                  <TableRow>
                    <TableCell>Package Name</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>

                  {filterPackage.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No Data Found
                      </TableCell>
                    </TableRow>
                  ) :

                    (filterPackage.map((singlePackage) => (
                      <TableRow key={singlePackage._id}>
                        <TableCell>{singlePackage.label}</TableCell>
                        <TableCell>{singlePackage.duration - 1}N {singlePackage.duration}D</TableCell>
                        <TableCell>
                          {packageIds.includes(singlePackage._id) ? <Button variant="contained" color="error" onClick={() => handleRemove(singlePackage._id)}><DeleteIcon /></Button> :
                            <Button variant="contained" color="success" onClick={() => handleAdd(singlePackage._id)}><AddIcon /></Button>
                          }
                        </TableCell>
                      </TableRow>

                    )))

                  }


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
                  <TableRow>
                    <TableCell>Package Name</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  {filteredDestinationPkgs.length === 0 && <TableRow>
                    <TableCell colSpan={3} align="center">
                      No Data Found
                    </TableCell>
                  </TableRow>}
                  {filteredDestinationPkgs.map((pkg) => (
                    <TableRow>
                      <TableCell>{pkg.label}</TableCell>
                      <TableCell>{pkg.duration - 1}N {pkg.duration}D</TableCell>
                      <TableCell><Button variant="contained" color="error" onClick={() => handleRemove(pkg._id)}><DeleteIcon /></Button></TableCell>
                    </TableRow>
                  ))}
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
