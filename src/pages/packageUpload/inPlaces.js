import { Button, Card, CardContent, Divider, Grid, List, ListItem, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllPackages, getPackagesByLocation } from "../../api/packageAPI";
import { getSinglePlace } from "../../api/placeApi";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';


const PackageUploadInPlaces = () => {

  const { id } = useParams();
  const [singleData, setsingleData] = useState({});
  const [locationData, setLocationData] = useState([]);
  const [logicArr, setLogicArr] = useState([]);
  const [packageData, setPackageData] = useState([]);

 useEffect(() => {
  const fetchData = async () => {
    const singleData = await getSinglePlace(id);
    setsingleData(singleData.data);
    console.log("this is my data", singleData);

    if (singleData.zone) {
      const locationData = await getPackagesByLocation(singleData.zone);
      console.log("this is my location", locationData.data);
      setLocationData(locationData.data);
    }
  };
  fetchData();
}, [id]);

const handleAdd = (packageId) => {
  setLogicArr([...logicArr,packageId]);
  const fetchData = async () => {
    const packageData = await getAllPackages();
    setPackageData(packageData.data);
    console.log("package data",packageData.data);
  //   if(packageData.data.map((info) => {
      
  //   }))
  // }
  fetchData();
  
}

const handleRemove = (packageId) => {
  setLogicArr((prev) => prev.filter((id) => id !== packageId));
}



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
          <Card sx={{width: "100%"}}>
            <Typography variant="h5">Final Packages</Typography>
            <CardContent sx={{ flexGrow: 1 }}>
              <List>
                <ListItem></ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

}

export default PackageUploadInPlaces;
