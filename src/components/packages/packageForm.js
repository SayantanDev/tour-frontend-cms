import React from 'react';
import { Formik, FieldArray, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Button, Grid, TextField, Typography, Switch, FormControlLabel, Paper, Divider, IconButton, Chip, Stack,
  MenuItem
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { createPackage, updatePackage } from '../../api/packageAPI';
import useSnackbar from '../../hooks/useSnackbar';
import { useSelector } from 'react-redux';

import _ from 'lodash';

const getInitialValues = (data) => {
  const newData = {
  disabled: false,
  image: '',
  duration: '',
  isActive: false,
  tags: [],
  location: '',
  type: '',
  url: '',
  label: '',
  meta: { title: '', description: '', keywords: [] },
  details: {
    header: { h1: '', h2: '', h3: '' },
    overview: [{ tagName: '', tagValue: '' }],
    covering: [''],
    shortItinerary: [{ tagName: '', tagValue: '' }],
    itinerary: [{ headerTag: '', headerValue: '', Distance: '', Duration: '', Altitude: '', Time: '', para: '' }],
    howToReach: { para: '' },
    cost: {
      singleCost: '',
      multipleCost: [{ pax: '', Standard: '', Budget: '' }],
      valueCost: [{ type: '', price: '' }],
      inclusions: [''],
      exclusions: [''],
    },
    thingsToCarry: {
      Basics: [],
      Documents: [],
      Clothing: [],
      Medicine: [],
      Toiletries: [],
      Accessories: [],
    }
  }
};
if (data) {
    return _.merge({}, newData, data);
  }

  return newData;
}

const validationSchema = Yup.object({
  location: Yup.string().required('Location is required'),
  type: Yup.string().required('Type is required'),
  url: Yup.string().required('URL is required'),
  label: Yup.string().required('Label is required')
})
const SectionWrapper = ({ title, children }) => (
  <Grid item xs={12} component={Paper} elevation={2} sx={{ p: 2, mb: 3 }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Grid>
);

const RenderStringArray = ({ name, values, handleChange, label }) => (
  <FieldArray name={name}>
    {({ push, remove }) => (
      <>
        {values.map((val, index) => (
          <Grid container spacing={1} key={index} sx={{ pb: 2 }}>
            <Grid item xs={11}>
              <TextField
                label={`${label} ${index + 1}`}
                name={`${name}[${index}]`}
                value={val}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={1}>
              <Button onClick={() => remove(index)} color="error">X</Button>
            </Grid>
          </Grid>
        ))}
        <Button onClick={() => push('')}>Add {label}</Button>
      </>
    )}
  </FieldArray>
);
const RenderEditableList = ({ name, values, setFieldValue, label }) => {
  const [inputValue, setInputValue] = React.useState('');
  const [editIndex, setEditIndex] = React.useState(null);

  const handleAddOrUpdate = () => {
    const updatedList = [...values];
    if (editIndex !== null) {
      updatedList[editIndex] = inputValue;
      setEditIndex(null);
    } else {
      updatedList.push(inputValue);
    }
    setFieldValue(name, updatedList);
    setInputValue('');
  };

  const handleEdit = (index, event) => {
    event.stopPropagation();
    setInputValue(values[index]);
    setEditIndex(index);
  };

  const handleDelete = (index, event) => {
    event.stopPropagation();
    const updatedList = [...values];
    updatedList.splice(index, 1);
    setFieldValue(name, updatedList);
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={10}>
          <TextField
            label={`Add ${label}`}
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" fullWidth onClick={handleAddOrUpdate}>
            {editIndex !== null ? 'Update' : 'Add'}
          </Button>
        </Grid>
      </Grid>
      <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
        {values.map((item, index) => (
          <Chip
            key={index}
            label={item}
            onDelete={(e) => handleDelete(index, e)}
            onClick={(e) => handleEdit(index, e)}
            sx={{ m: 0.5 }}
            deleteIcon={<Delete fontSize="small" />}
          />
        ))}
      </Stack>
    </Box>
  );
};

const PackageForm = () => {
  const { fetchSelectedPackage: selectedPackage } = useSelector((state) => state.package);
  // const getInitialValues = (selectedPackage) => selectedPackage || initialValues;

  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const handleSubmit = async (values) => {
    
    try {
      // let res;
      if (selectedPackage && selectedPackage._id) {
       const res = await updatePackage(values, selectedPackage._id); // You'll need to import and define this API
       if (res) {
        showSnackbar('Package updated successfully', 'success');
        
       }
      } else {
        const res = await createPackage(values);
        showSnackbar('You created a new package', 'success');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar('Something went wrong', 'error');
    }
  };


  return (<>
    <Formik
      initialValues={getInitialValues(selectedPackage)}
      enableReinitialize
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ values, handleChange, setFieldValue, errors, touched }) => (
        <Box sx={{ position: 'relative' }}>
          <Box sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: '#fff',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Typography variant={"h4"}>Create a new Package</Typography>
            <Button variant="contained" type="submit" form="package-form">Submit</Button>
          </Box>
          <Form id="package-form">
            <Grid container spacing={2} sx={{ p: 2 }}>

              <SectionWrapper title="Basic Info" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Image URL" name="image" value={values.image} onChange={handleChange} fullWidth /></Grid>
                  <Grid item xs={3}><TextField label="Duration (days)" name="duration" value={values.duration} onChange={handleChange} fullWidth /></Grid>
                  {/* <Grid item xs={3}><FormControlLabel control={<Switch name="disabled" checked={values.disabled} onChange={handleChange} />} label="Disabled" /></Grid> */}
                  <Grid item xs={3}><FormControlLabel control={<Switch name="isActive" checked={values.isActive} onChange={handleChange} />} label="Is Active" /></Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Location"
                      name="location"
                      value={values.location}
                      onChange={handleChange}
                      error={touched.location && Boolean(errors.location)}
                      helperText={touched.location && errors.location}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Type"
                      name="type"
                      value={values.type}
                      onChange={handleChange}
                      error={touched.type && Boolean(errors.type)}
                      helperText={touched.type && errors.type}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="URL"
                      name="url"
                      value={values.url}
                      onChange={handleChange}
                      error={touched.url && Boolean(errors.url)}
                      helperText={touched.url && errors.url}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Label"
                      name="label"
                      value={values.label}
                      onChange={handleChange}
                      error={touched.label && Boolean(errors.label)}
                      helperText={touched.label && errors.label}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </SectionWrapper>

              <SectionWrapper title="Header">
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField label="H1" name="details.header.h1" value={values.details.header.h1} onChange={handleChange} fullWidth /></Grid>
                  <Grid item xs={4}><TextField label="H2" name="details.header.h2" value={values.details.header.h2} onChange={handleChange} fullWidth /></Grid>
                  <Grid item xs={4}><TextField label="H3" name="details.header.h3" value={values.details.header.h3} onChange={handleChange} fullWidth /></Grid>
                </Grid>
              </SectionWrapper>

              <SectionWrapper title="Meta Data">
                <Grid container spacing={2}>
                  <Grid item xs={12}><TextField label="Meta Title" name="meta.title" value={values.meta.title} onChange={handleChange} fullWidth /></Grid>
                  <Grid item xs={12}><TextField label="Meta Description" name="meta.description" value={values.meta.description} onChange={handleChange} fullWidth /></Grid>
                  <Grid item xs={12}>
                    <RenderEditableList name="meta.keywords" values={values.meta.keywords} setFieldValue={setFieldValue} label="Meta Keywords" />
                  </Grid>
                </Grid>
              </SectionWrapper>

              <SectionWrapper title="Overview">
                <FieldArray name="details.overview">
                  {({ push, remove }) => (
                    <>
                      {values.details.overview.map((_, index) => (
                        <Grid container spacing={1} key={index} sx={{ mb: 2 }}>
                          <Grid item xs={5}><TextField label="Tag Name" name={`details.overview[${index}].tagName`} value={values.details.overview[index].tagName} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={5}><TextField label="Tag Value" name={`details.overview[${index}].tagValue`} value={values.details.overview[index].tagValue} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={2}><Button onClick={() => remove(index)} color="error">Remove</Button></Grid>
                        </Grid>
                      ))}
                      <Grid item xs={12}><Button onClick={() => push({ tagName: '', tagValue: '' })}>Add Overview</Button></Grid>
                    </>
                  )}
                </FieldArray>
              </SectionWrapper>
              <SectionWrapper title="Short Itinerary">
                <FieldArray name="details.shortItinerary">
                  {({ push, remove }) => (
                    <>
                      {values.details.shortItinerary.map((_, index) => (
                        <Grid container spacing={1} key={index} sx={{ pb: 2 }}>
                          <Grid item xs={5}><TextField label="Tag Name" name={`details.shortItinerary[${index}].tagName`} value={values.details.shortItinerary[index].tagName} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={5}><TextField label="Tag Value" name={`details.shortItinerary[${index}].tagValue`} value={values.details.shortItinerary[index].tagValue} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={2}><Button onClick={() => remove(index)} color="error">Remove</Button></Grid>
                        </Grid>
                      ))}
                      <Grid item xs={12}><Button onClick={() => push({ tagName: '', tagValue: '' })}>Add Itinerary</Button></Grid>
                    </>
                  )}
                </FieldArray>
              </SectionWrapper>

              <SectionWrapper title="Itinerary">
                <FieldArray name="details.itinerary">
                  {({ push, remove }) => (
                    <>
                      {values.details.itinerary.map((item, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                          <Grid item xs={3}>
                            <TextField
                              label="Header Tag"
                              name={`details.itinerary[${index}].headerTag`}
                              value={values.details.itinerary[index].headerTag}
                              onChange={(e) => {
                                const selectedTag = e.target.value;
                                const match = values.details.shortItinerary.find(si => si.tagName === selectedTag);
                                setFieldValue(`details.itinerary[${index}].headerTag`, selectedTag);
                                setFieldValue(`details.itinerary[${index}].headerValue`, match ? match.tagValue : '');
                              }}
                              select
                              fullWidth
                            >
                              {values.details.shortItinerary.map((opt, idx) => (
                                <MenuItem key={idx} value={opt.tagName}>{opt.tagName}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              label="Header Value"
                              name={`details.itinerary[${index}].headerValue`}
                              value={values.details.itinerary[index].headerValue}
                              select
                              fullWidth
                              onChange={handleChange}
                            >
                              {values.details.shortItinerary.map((opt, idx) => (
                                <MenuItem key={idx} value={opt.tagValue}>{opt.tagValue}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={2}><TextField label="Distance" name={`details.itinerary[${index}].Distance`} value={values.details.itinerary[index].Distance} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={2}><TextField label="Duration" name={`details.itinerary[${index}].Duration`} value={values.details.itinerary[index].Duration} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={2}><TextField label="Altitude" name={`details.itinerary[${index}].Altitude`} value={values.details.itinerary[index].Altitude} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={2}><TextField label="Time" name={`details.itinerary[${index}].Time`} value={values.details.itinerary[index].Time} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={10}><TextField label="Paragraph" name={`details.itinerary[${index}].para`} value={values.details.itinerary[index].para} onChange={handleChange} multiline fullWidth /></Grid>
                          <Grid item xs={12}><Button onClick={() => remove(index)} color="error">Remove</Button></Grid>
                        </Grid>
                      ))}
                      <Button onClick={() => push({ headerTag: '', headerValue: '', Distance: '', Duration: '', Altitude: '', Time: '', para: '' })}>Add Itinerary</Button>
                    </>
                  )}
                </FieldArray>
              </SectionWrapper>

              <SectionWrapper title="How To Reach">
                <TextField label="Paragraph" name="details.howToReach.para" value={values.details.howToReach.para} onChange={handleChange} multiline rows={3} fullWidth />
              </SectionWrapper>

              <SectionWrapper title="Costing">
                <Grid container spacing={2}>
                  <Grid item xs={3}><TextField label="Single Cost" name="details.cost.singleCost" value={values.details.cost.singleCost} onChange={handleChange} fullWidth /></Grid>
                </Grid>
                <Typography sx={{ mt: 2, mb: 1 }}>Multiple Cost</Typography>

                <FieldArray name="details.cost.multipleCost">
                  {({ push, remove }) => (
                    <>
                      {values.details.cost.multipleCost.map((_, index) => (
                        <Grid container spacing={1} key={index} sx={{ mb: 2 }}>
                          <Grid item xs={3}><TextField label="Pax" name={`details.cost.multipleCost[${index}].pax`} value={values.details.cost.multipleCost[index].pax} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={3}><TextField label="Standard" name={`details.cost.multipleCost[${index}].Standard`} value={values.details.cost.multipleCost[index].Standard} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={3}><TextField label="Budget" name={`details.cost.multipleCost[${index}].Budget`} value={values.details.cost.multipleCost[index].Budget} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={1}><Button onClick={() => remove(index)} color="error">X</Button></Grid>
                        </Grid>
                      ))}
                      <Grid item xs={12}><Button onClick={() => push({ pax: '', Standard: '', Budget: '' })}>Add Cost Option</Button></Grid>
                    </>
                  )}
                </FieldArray>
              </SectionWrapper>
              <SectionWrapper title="Tags">
                <RenderEditableList name="tags" values={values.tags} setFieldValue={setFieldValue} label="Tag" />
              </SectionWrapper>

              <SectionWrapper title="Covering">
                <RenderEditableList name="details.covering" values={values.details.covering} setFieldValue={setFieldValue} label="Place" />
              </SectionWrapper>
              <SectionWrapper title="Inclusions">
                <RenderStringArray name="details.cost.inclusions" values={values.details.cost.inclusions} handleChange={handleChange} label="Inclusion" />
              </SectionWrapper>

              <SectionWrapper title="Exclusions">
                <RenderStringArray name="details.cost.exclusions" values={values.details.cost.exclusions} handleChange={handleChange} label="Exclusion" />
              </SectionWrapper>
              <SectionWrapper title="Things To Carry - Basics">
                <RenderEditableList name="details.thingsToCarry.Basics" values={values.details.thingsToCarry.Basics} setFieldValue={setFieldValue} label="Basic Item" />
              </SectionWrapper>

              <SectionWrapper title="Things To Carry - Documents">
                <RenderEditableList name="details.thingsToCarry.Documents" values={values.details.thingsToCarry.Documents} setFieldValue={setFieldValue} label="Document" />
              </SectionWrapper>

              <SectionWrapper title="Things To Carry - Clothing">
                <RenderEditableList name="details.thingsToCarry.Clothing" values={values.details.thingsToCarry.Clothing} setFieldValue={setFieldValue} label="Clothing" />
              </SectionWrapper>

              <SectionWrapper title="Things To Carry - Medicine">
                <RenderEditableList name="details.thingsToCarry.Medicine" values={values.details.thingsToCarry.Medicine} setFieldValue={setFieldValue} label="Medicine" />
              </SectionWrapper>

              <SectionWrapper title="Things To Carry - Toiletries">
                <RenderEditableList name="details.thingsToCarry.Toiletries" values={values.details.thingsToCarry.Toiletries} setFieldValue={setFieldValue} label="Toiletry" />
              </SectionWrapper>

              <SectionWrapper title="Things To Carry - Accessories">
                <RenderEditableList name="details.thingsToCarry.Accessories" values={values.details.thingsToCarry.Accessories} setFieldValue={setFieldValue} label="Accessory" />
              </SectionWrapper>

            </Grid>
          </Form>
        </Box>
      )}
    </Formik>
    <SnackbarComponent />
  </>

  );
};

export default PackageForm;