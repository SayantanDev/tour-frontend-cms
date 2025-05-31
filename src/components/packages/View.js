import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getSinglePackages } from '../../api/packageAPI';
import {
 Box,
 Tabs,
 Tab,
 Typography,
 Card,
 CardContent,
 List,
 ListItem,
 Chip,
 Grid,
} from "@mui/material";

function View() {
 const { id } = useParams();
 const [singleData, setSingleData] = useState([]);
 const [selectedDay, setSelectedDay] = useState(null);

 const [tabIndex, setTabIndex] = useState(0);

 const handleTabChange = (event, newValue) => {
  setTabIndex(newValue);
 };

 useEffect(() => {
  const fetchdata = async () => {
   const singleData = await getSinglePackages(id)
   setSingleData(singleData.data)
  }
  fetchdata();

 }, [id])

 return (
  <Box
   sx={{
    width: "100%",
    maxWidth: 1000,
    mx: "auto",
    mt: 4,
    p: 3,
    background: "linear-gradient(to right, #ff9966, #ff5e62)",
    borderRadius: 3,
    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
   }}
  >
   {/* Header */}
   <Typography variant="h4" sx={{ mb: 2, color: "#fff", textAlign: "center", fontWeight: "bold" }}>
    {singleData.label}
   </Typography>


   {/* Tabs */}
   <Tabs
    value={tabIndex}
    onChange={handleTabChange}
    sx={{
     mt: 2,
     "& .MuiTabs-indicator": { backgroundColor: "#fff" },
     "& .MuiTab-root": {
      color: "#fff",
      fontWeight: "bold",
      textTransform: "none",
      "&.Mui-selected": { color: "#000" },
     },
    }}
    variant="fullWidth"
   >
    <Tab label="Basic Information" />
    <Tab label="Overview" />
    <Tab label="Itinerary" />
    <Tab label="Cost" />
    <Tab label="How to Reach" />
    <Tab label="Things to Carry" />
   </Tabs>

      {/* Basic Information */}
      {tabIndex === 0 && (
    <Card
     sx={{
      mt: 2,
      p: 3,
      backgroundColor: "#fff8e1",
      borderRadius: 2,
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
     }}
    >
     <CardContent>
      <Grid container spacing={2}>
       
        <Grid
         item
         xs={12}
         key={singleData._id}
         sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#ffebee",
          p: 2,
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
         }}
        >
         <Chip
          label="Package Name"
          sx={{
           backgroundColor: "#ff5e62",
           color: "#fff",
           fontWeight: "bold",
           mr: 2,
           px: 1.5,
          }}
         />
         <Typography sx={{ color: "#333", fontSize: "1rem", fontWeight: "500" }}>
          {singleData.label}
         </Typography>
        </Grid>
        <Grid
         item
         xs={12}
         key={singleData._id}
         sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#ffebee",
          p: 2,
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
         }}
        >
         <Chip
          label="Package Type"
          sx={{
           backgroundColor: "#ff5e62",
           color: "#fff",
           fontWeight: "bold",
           mr: 2,
           px: 1.5,
          }}
         />
         <Typography sx={{ color: "#333", fontSize: "1rem", fontWeight: "500" }}>
          {singleData.type}
         </Typography>
        </Grid>
        <Grid
         item
         xs={12}
         key={singleData._id}
         sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#ffebee",
          p: 2,
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
         }}
        >
         <Chip
          label="Link"
          sx={{
           backgroundColor: "#ff5e62",
           color: "#fff",
           fontWeight: "bold",
           mr: 2,
           px: 1.5,
          }}
         />
         <Typography sx={{ color: "#333", fontSize: "1rem", fontWeight: "500" }}>
          {singleData.url}
         </Typography>
        </Grid>

        <Grid
         item
         xs={12}
         key={singleData._id}
         sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#ffebee",
          p: 2,
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
         }}
        >
         <Chip
          label="Location"
          sx={{
           backgroundColor: "#ff5e62",
           color: "#fff",
           fontWeight: "bold",
           mr: 2,
           px: 1.5,
          }}
         />
         <Typography sx={{ color: "#333", fontSize: "1rem", fontWeight: "500" }}>
          {singleData.location}
         </Typography>
        </Grid>
        <Grid
         item
         xs={12}
         key={singleData._id}
         sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#ffebee",
          p: 2,
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
         }}
        >
         <Chip
          label="tags"
          sx={{
           backgroundColor: "#ff5e62",
           color: "#fff",
           fontWeight: "bold",
           mr: 2,
           px: 1.5,
          }}
         />
         <Typography sx={{ color: "#333", fontSize: "1rem", fontWeight: "500" }}>
         {singleData.tags?.map((tag, index) => (
         <Chip key={index} label={tag} variant="outlined" sx={{ fontSize: "0.9rem", fontWeight: "500" }} />
        ))}
         </Typography>
        </Grid>
       
      </Grid>
     </CardContent>
    </Card>
   )}

   {/* Overview */}
   {tabIndex === 1 && (
    <Card
     sx={{
      mt: 2,
      p: 3,
      backgroundColor: "#fff8e1",
      borderRadius: 2,
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
     }}
    >
     <CardContent>
      <Grid container spacing={2}>
       {singleData.details?.overview.map((item) => (
        <Grid
         item
         xs={12}
         key={item._id}
         sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#ffebee",
          p: 2,
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
         }}
        >
         <Chip
          label={item.tagName}
          sx={{
           backgroundColor: "#ff5e62",
           color: "#fff",
           fontWeight: "bold",
           mr: 2,
           px: 1.5,
          }}
         />
         <Typography sx={{ color: "#333", fontSize: "1rem", fontWeight: "500" }}>
          {item.tagValue}
         </Typography>
        </Grid>
       ))}
      </Grid>
     </CardContent>
    </Card>
   )}

   {/* Itinerary */}
   {tabIndex === 2 && (
    <Card sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
     <CardContent>
      <Typography variant="h6" sx={{ color: "#1565c0" }}>
       Itinerary
      </Typography>
      <List>
       {singleData.details?.itinerary.map((day) => (
        <div key={day._id}>
         {/* Clickable List Item */}
         <ListItem
          sx={{
           "&:hover": { backgroundColor: "#bbdefb", borderRadius: 1, transition: "0.3s" },
           cursor: "pointer",
          }}
          onClick={() => setSelectedDay(selectedDay === day._id ? null : day._id)}
         >
          <Typography>
           <strong>{day.headerTag}:</strong> {day.headerValue} ({day.Distance})
          </Typography>
         </ListItem>

         {/* Show details if selected */}
         {selectedDay === day._id && (
          <Card sx={{ mt: 1, p: 2, backgroundColor: "#f1f8e9", borderRadius: 2 }}>
           <Typography variant="body1">
            <strong>Altitude:</strong> {day.Altitude}
           </Typography>
           <Typography variant="body1">
            <strong>Distance:</strong> {day.Distance}
           </Typography>
           <Typography variant="body1">
            <strong>Duration:</strong> {day.Duration}
           </Typography>
           <Typography variant="body1">
            <strong>Time:</strong> {day.Time}
           </Typography>
           <Typography
            variant="body2"
            sx={{ mt: 1 }}
            dangerouslySetInnerHTML={{ __html: day.para }}
           />
          </Card>
         )}
        </div>
       ))}
      </List>
     </CardContent>
    </Card>
   )}

   {/* Cost */}
   {tabIndex === 3 && (
    <Card sx={{ mt: 2, p: 2, backgroundColor: "#fce4ec", borderRadius: 2 }}>
     <CardContent>
      <Typography variant="h6" sx={{ color: "#d81b60" }}>
       Cost Details
      </Typography>
      <Typography>Single Cost: ₹{singleData.details.cost.singleCost}</Typography>
      <Typography variant="h6" sx={{ mt: 1, color: "#d81b60" }}>
       Inclusions:
      </Typography>
      <List>
       {singleData.details.cost.inclusions.map((item, index) => (
        <ListItem key={index}>- {item}</ListItem>
       ))}
      </List>
      <Typography variant="h6" sx={{ mt: 1, color: "#d81b60" }}>
       Exclusions:
      </Typography>
      <List>
       {singleData.details.cost.exclusions.map((item, index) => (
        <ListItem key={index}>- {item}</ListItem>
       ))}
      </List>
     </CardContent>
    </Card>
   )}

   {/* How to Reach */}
   {tabIndex === 4 && (
    <Card sx={{ mt: 2, p: 2, backgroundColor: "#d7ffd9", borderRadius: 2 }}>
     <CardContent>
      <Typography variant="h6" sx={{ color: "#1b5e20" }}>
       How to Reach
      </Typography>
      <Typography dangerouslySetInnerHTML={{ __html: singleData.details.howToReach.para }} />
     </CardContent>
    </Card>
   )}

   {/* Things to Carry */}
   {tabIndex === 5 && (
    <Card sx={{ mt: 2, p: 2, backgroundColor: "#fff3e0", borderRadius: 2 }}>
     <CardContent>
      <Typography variant="h6" sx={{ color: "#ff6f00" }}>
       Things to Carry
      </Typography>
      <Typography variant="subtitle1" sx={{ color: "#ff6f00" }}>
       Basics:
      </Typography>
      <List>
       {singleData.details.thingsToCarry.Basics.map((item, index) => (
        <ListItem key={index}>{item}</ListItem>
       ))}
      </List>
      <Typography variant="subtitle1" sx={{ color: "#ff6f00" }}>
       Accessories:
      </Typography>
      <List>
       {singleData.details.thingsToCarry.Accessories.map((item, index) => (
        <ListItem key={index}>{item}</ListItem>
       ))}
      </List>
     </CardContent>
    </Card>
   )}
  </Box>
 )
}

export default View