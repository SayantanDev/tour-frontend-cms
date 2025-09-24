import { Button, Card, CardContent, Divider, Grid, List, ListItem, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllPackages, getPackagesByLocation } from "../../api/packageAPI";
import { getSinglePlace, UpdatePlacesPacakges } from "../../api/placeApi";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { object } from "yup";


const PackageUploadInPlaces = () => {

  const { id } = useParams();
  const [singleData, setsingleData] = useState({});
  const [locationData, setLocationData] = useState([]);
  const [logicArr, setLogicArr] = useState([]);
  const [packageData, setPackageData] = useState([]);
  const [packageIds, setPackageIds] = useState([]);

 useEffect(() => {
  const fetchData = async () => {
    const res = await getSinglePlace(id);
    setsingleData(res);
    setPackageIds(res.details.packages.package_ids);
    console.log("this is my data", res);

    if (singleData.zone) {
      const locationData = await getPackagesByLocation(singleData.zone);
      console.log("this is my location", locationData.data);
      setLocationData(locationData.data);
    }

    const allPackages = await getAllPackages();
    setPackageData(allPackages);
    console.log("this is packages",packageData);
    

  };
  fetchData();
}, [id]);

const handleAdd = async (packageId) => {
  setLogicArr((prev) => [...prev, packageId]);
  console.log(packageId);
  const obj = {
    "add": [packageId],
  }
  
  // if(packageId) {
  //   // const sendData = async () => {
  //     await UpdatePlacesPacakges(id,obj);
  //   // }
  //   // sendData();
  // }
  // console.log(obj);
  
};

const handleRemove = async (packageId) => {
  setLogicArr((prev) => prev.filter((id) => id !== packageId));
  const obj = {
    "remove": [packageId],
  }

  if(packageId) {
   
  //   await UpdatePlacesPacakges(id,obj);
  }
  console.log(obj);
  
}

const finalPackages = packageData.filter((pkg) => packageIds.includes(pkg._id));



console.log(logicArr);



  return (
    <>
      <Grid container gap={5} alignItems="stretch">
        <Grid item xs={5}>
          <Card sx={{width: "100%",mb:4, display:'flex',flexDirection:"column", alignItems:"center"}}> 
            <Typography variant="h5" fontWeight='bold'><ul>Preferred Packages</ul></Typography>
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
                  
                  {locationData.map((singlePackage) => (
                    <TableRow key={singlePackage._id}>
                      <TableCell>{singlePackage.label}</TableCell>
                      <TableCell>{singlePackage.duration -1}N {singlePackage.duration}D</TableCell>
                      <TableCell>
                        {logicArr.includes(singlePackage._id) ? <Button variant="contained" color="error" onClick={() => handleRemove(singlePackage._id)}><DeleteIcon/></Button> : 
                        <Button variant="contained" color="success" onClick={() => handleAdd(singlePackage._id)}><AddIcon /></Button>
                        }
                      </TableCell>
                    </TableRow>
                    
                  ))}
                  
                    
                    
                  
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Divider orientation="vertical" variant="middle" flexItem  />

        <Grid item xs={5}>
          <Card sx={{width: "100%",mb:4, display:'flex',flexDirection:"column", alignItems:"center"}}>
            <Typography variant="h5" fontWeight="bold"><ul>Final Packages</ul></Typography>
            <CardContent sx={{ flexGrow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Package Name</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {finalPackages.map((pkg) => (
                    <TableRow>
                      <TableCell>{pkg.label}</TableCell>
                      <TableCell>{pkg.duration - 1}N {pkg.duration}D</TableCell>
                    </TableRow>
                  ))} */}
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
