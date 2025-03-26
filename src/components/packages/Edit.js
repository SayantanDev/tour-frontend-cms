import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import DeleteIcon from '@mui/icons-material/Delete';
import { Stepper, Step, StepLabel, Button, Card, CardContent, Typography, TextField, List, ListItem, IconButton, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { Margin } from "@mui/icons-material";

const steps = ["Package Info", "Overview", "Short Itinerary", "Itinerary", "Cost", "How to Reach", "Things to Carry","Covering"];

function Edit() {
 const { fetchSelectedPackage } = useSelector((state) => state.package);
 const [activeStep, setActiveStep] = useState(0);
 const [selectedDay, setSelectedDay] = useState(null);
 return (
  <Formik
   initialValues={fetchSelectedPackage}
   onSubmit={(values) => {
    console.log(values);
   }}
  >
   {({ values, handleChange, handleSubmit, setFieldValue }) => (
    <Form>
     <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label, index) => (
       <Step key={index}>
        <StepLabel>{label}</StepLabel>
       </Step>
      ))}
     </Stepper>

     <Card sx={{ mt: 2, p: 3 }}>
      <CardContent>
       {activeStep === 0 && (
        <>
         <Typography variant="h6">Package Info</Typography>
         <Field name="label" as={TextField} label="Package Name" fullWidth margin="normal" onChange={handleChange} />
         <Field name="type" as={TextField} label="Package Type" fullWidth margin="normal" onChange={handleChange} />
         <Field name="url" as={TextField} label="Link" fullWidth margin="normal" onChange={handleChange} />
         <Field name="location" as={TextField} label="Location" fullWidth margin="normal" onChange={handleChange} />
        </>
       )}

       {activeStep === 1 && (
        <>
         <Typography variant="h6">Overview</Typography>
         {values.details?.overview.map((item, index) => (
          <Field key={index} name={`details.overview[${index}].tagValue`} as={TextField} label={item.tagName} fullWidth margin="normal" onChange={handleChange} />
         ))}
        </>
       )}
       {activeStep === 2 && (
        <>
         <Card sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
          <CardContent>
           <Typography variant="h6" sx={{ color: "#1565c0" }}>
            Short Itinerary
           </Typography>
           <List>
            {values.details?.shortItinerary.map((day, index) => (
             <div key={index}>
              {/* Clickable List Item */}
              <ListItem
               sx={{
                "&:hover": { backgroundColor: "#bbdefb", borderRadius: 1, transition: "0.3s" },
                cursor: "pointer",
               }}
               onClick={() => setSelectedDay(selectedDay === index ? null : index)}
              >
               <Field
                name={`details.itinerary[${index}].headerValue`}
                as={TextField}
                label={`Day ${index + 1}`}
                fullWidth
                margin="normal"
                onChange={handleChange}
               />
               
              </ListItem>
             </div>
            ))}
           </List>
          </CardContent>
         </Card>
        </>
       )}
       {activeStep === 3 && (
        <>
         <Card sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
          <CardContent>
           <Typography variant="h6" sx={{ color: "#1565c0" }}>
            Itinerary
           </Typography>
           <List>
            {values.details?.itinerary.map((day, index) => (
             <div key={index}>
              {/* Clickable List Item */}
              <ListItem
               sx={{
                "&:hover": { backgroundColor: "#bbdefb", borderRadius: 1, transition: "0.3s" },
                cursor: "pointer",
               }}
               onClick={() => setSelectedDay(selectedDay === index ? null : index)}
              >
               <Field
                name={`details.itinerary[${index}].headerValue`}
                as={TextField}
                label={`Day ${index + 1}`}
                fullWidth
                margin="normal"
                onChange={handleChange}
               />

               <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click event
                    const newItinerary = values.details.itinerary.filter((_, i) => i !== index);
                    setFieldValue("details.itinerary", newItinerary);
                    setSelectedDay(null);
                  }}
                  color="error"
                  sx={{ ml: 2 }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>

              {/* Show details if selected */}
              {selectedDay === index && (
               <Card sx={{ mt: 1, p: 2, backgroundColor: "#f1f8e9", borderRadius: 2 }}>
                <Field
                 name={`details.itinerary[${index}].Altitude`}
                 as={TextField}
                 label="Altitude"
                 fullWidth
                 margin="normal"
                 onChange={handleChange}
                />
                <Field
                 name={`details.itinerary[${index}].Distance`}
                 as={TextField}
                 label="Distance"
                 fullWidth
                 margin="normal"
                 onChange={handleChange}
                />
                <Field
                 name={`details.itinerary[${index}].Duration`}
                 as={TextField}
                 label="Duration"
                 fullWidth
                 margin="normal"
                 onChange={handleChange}
                />
                <Field
                 name={`details.itinerary[${index}].Time`}
                 as={TextField}
                 label="Time"
                 fullWidth
                 margin="normal"
                 onChange={handleChange}
                />
                <Field
                 name={`details.itinerary[${index}].para`}
                 as={TextField}
                 label="Description"
                 fullWidth
                 margin="normal"
                 multiline
                 rows={3}
                 onChange={handleChange}
                />
               </Card>
              )}
             </div>
            ))}
           </List>
          </CardContent>
         </Card>
        </>
       )}

       {activeStep === 4 && (
        <>
         <Typography variant="h6">Cost Details</Typography>
         <Field name="details.cost.singleCost" as={TextField} label="Single Cost" fullWidth margin="normal" onChange={handleChange} />
        </>
       )}

       {activeStep === 5 && (
        <>
         <Typography variant="h6">How to Reach</Typography>
         <Field name="details.howToReach.para" as={TextField} label="How to Reach" fullWidth margin="normal" multiline rows={3} onChange={handleChange} />
        </>
       )}

       {activeStep === 6 && (
        <>
         <Typography variant="h6">Things to Carry</Typography>
         <Field name="details.thingsToCarry.Basics" as={TextField} label="Basics" fullWidth margin="normal" onChange={handleChange} />
         <Field name="details.thingsToCarry.Accessories" as={TextField} label="Accessories" fullWidth margin="normal" onChange={handleChange} />
        </>
       )}
       {activeStep === 7 && (
        <>
         <Typography variant="h6">Covering</Typography>
         <Field name="details.covering" as={TextField} label="Covering" fullWidth margin="normal" onChange={handleChange} />
        </>
       )}
      </CardContent>
      <Box style={{ marginTop: 10, display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
       <Button disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
        Back
       </Button>
       {activeStep === steps.length - 1 ? (
        <Button type="submit" variant="contained" color="primary">
         Save
        </Button>
       ) : (
        <Button variant="contained" color="primary" onClick={() => setActiveStep((prev) => prev + 1)}>
         Next
        </Button>
       )}
      </Box>
     </Card>
    </Form>
   )}
  </Formik>
 )
}

export default Edit