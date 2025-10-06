import React from 'react';
import { Formik, FieldArray, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Button, Grid, TextField, Typography, Switch, FormControlLabel, Paper, Divider, IconButton, Chip, Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select
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
    shortInclusions: [''],
    details: {
      header: { h1: '', h2: '', h3: '' },
      overview: [{ tagName: '', tagValue: '' }],
      covering: [''],
      shortItinerary: [{ tagName: '', tagValue: '' }],
      itinerary: [{ headerTag: '', headerValue: '', Distance: '', Duration: '', Altitude: '', Time: '', para: [''], images: [''], activity: [''], inclusions: [''] }],
      howToReach: { para: [''], itineraryReach: [{ tagName: '', tagValue: [''] }] },
      cost: {
        singleCost: '',
        multipleCost: [{ pax: '', pricing: [{ catagory: '', price: '' }] }],
        daysCost: [{ days: '', pricing: [{ catagory: '', price: '' }] }],
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
        await createPackage(values);
        showSnackbar('You created a new package', 'success');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar('Something went wrong', 'error');
    }
  };

  const Region_obj = [
  {label: "None",
    val: "",
  },
  {label: "Sikkim",
    val: "sikkim",
  },
  {label: "Darjeeling",
    val: "darjeeling",
  },
  {label: "North Sikkim",
    val: "north-sikkim",
  },
  {label: "Meghalaya",
    val: "meghalaya",
  },
  {label: "Arunachal Pradesh",
    val: "arunachal-pradesh",
  }
]


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
            <Typography variant={"h4"}>{selectedPackage && selectedPackage._id ? 'Update ' : 'Create a new '}Package</Typography>
            <Button variant="contained" type="submit" form="package-form">{selectedPackage && selectedPackage._id ? 'Update ' : 'Create'}</Button>
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
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">Location</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={values.zone} 
                        label="Location"
                        onChange={handleChange}
                        name='location'
                      >
                        {Region_obj.map((obj) => <MenuItem key={obj.val} value={obj.val}>{obj.label}</MenuItem>)}
                      </Select>
                    </FormControl>
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
              <SectionWrapper title="Short Inclusions">
                <RenderEditableList name="shortInclusions" values={values.shortInclusions} setFieldValue={setFieldValue} label="Short Inclusions" />
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
                        <Grid container spacing={2} key={index} sx={{ mb: 4, border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
                          {/* Basic Fields */}
                          <Grid item xs={3}>
                            <TextField
                              label="Header Tag"
                              name={`details.itinerary[${index}].headerTag`}
                              value={item.headerTag}
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
                              value={item.headerValue}
                              onChange={handleChange}
                              select
                              fullWidth
                            >
                              {values.details.shortItinerary.map((opt, idx) => (
                                <MenuItem key={idx} value={opt.tagValue}>{opt.tagValue}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={2}><TextField label="Distance" name={`details.itinerary[${index}].Distance`} value={item.Distance} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={2}><TextField label="Duration" name={`details.itinerary[${index}].Duration`} value={item.Duration} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={2}><TextField label="Altitude" name={`details.itinerary[${index}].Altitude`} value={item.Altitude} onChange={handleChange} fullWidth /></Grid>
                          <Grid item xs={2}><TextField label="Time" name={`details.itinerary[${index}].Time`} value={item.Time} onChange={handleChange} fullWidth /></Grid>

                          {/* para[] */}
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Paragraphs</Typography>
                            <FieldArray name={`details.itinerary[${index}].para`}>
                              {({ push, remove }) => (
                                <Grid container spacing={1}>
                                  {item.para?.map((p, pIdx) => (
                                    <Grid item xs={12} key={pIdx}>
                                      <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        label={`Paragraph ${pIdx + 1}`}
                                        value={p}
                                        onChange={(e) =>
                                          setFieldValue(`details.itinerary[${index}].para[${pIdx}]`, e.target.value)
                                        }
                                        InputProps={{
                                          endAdornment: (
                                            <Button color="error" onClick={() => remove(pIdx)}>Remove</Button>
                                          ),
                                        }}
                                      />
                                    </Grid>
                                  ))}
                                  <Grid item xs={12}>
                                    <Button onClick={() => push('')} variant="outlined">
                                      Add Paragraph
                                    </Button>
                                  </Grid>
                                </Grid>
                              )}
                            </FieldArray>
                          </Grid>


                          {/* images[] */}
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">Image URLs</Typography>
                            <FieldArray name={`details.itinerary[${index}].images`}>
                              {({ push, remove }) => (
                                <Grid container spacing={1}>
                                  {item.images?.map((img, imgIdx) => (
                                    <Grid item xs={12} key={imgIdx}>
                                      <TextField
                                        fullWidth
                                        label={`Image ${imgIdx + 1}`}
                                        value={img}
                                        onChange={(e) =>
                                          setFieldValue(`details.itinerary[${index}].images[${imgIdx}]`, e.target.value)
                                        }
                                        InputProps={{
                                          endAdornment: (
                                            <Button color="error" onClick={() => remove(imgIdx)}>Remove</Button>
                                          )
                                        }}
                                      />
                                    </Grid>
                                  ))}
                                  <Grid item xs={12}>
                                    <Button onClick={() => push('')} variant="outlined">Add Image</Button>
                                  </Grid>
                                </Grid>
                              )}
                            </FieldArray>
                          </Grid>

                          {/* activity[] */}
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">Activities</Typography>
                            <FieldArray name={`details.itinerary[${index}].activity`}>
                              {({ push, remove }) => (
                                <Grid container spacing={1}>
                                  {item.activity?.map((act, actIdx) => (
                                    <Grid item xs={12} key={actIdx}>
                                      <TextField
                                        fullWidth
                                        label={`Activity ${actIdx + 1}`}
                                        value={act}
                                        onChange={(e) =>
                                          setFieldValue(`details.itinerary[${index}].activity[${actIdx}]`, e.target.value)
                                        }
                                        InputProps={{
                                          endAdornment: (
                                            <Button color="error" onClick={() => remove(actIdx)}>Remove</Button>
                                          )
                                        }}
                                      />
                                    </Grid>
                                  ))}
                                  <Grid item xs={12}>
                                    <Button onClick={() => push('')} variant="outlined">Add Activity</Button>
                                  </Grid>
                                </Grid>
                              )}
                            </FieldArray>
                          </Grid>

                          {/* inclusions[] */}
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">Inclusions</Typography>
                            <FieldArray name={`details.itinerary[${index}].inclusions`}>
                              {({ push, remove }) => (
                                <Grid container spacing={1}>
                                  {item.inclusions?.map((inc, incIdx) => (
                                    <Grid item xs={12} key={incIdx}>
                                      <TextField
                                        fullWidth
                                        label={`Inclusion ${incIdx + 1}`}
                                        value={inc}
                                        onChange={(e) =>
                                          setFieldValue(`details.itinerary[${index}].inclusions[${incIdx}]`, e.target.value)
                                        }
                                        InputProps={{
                                          endAdornment: (
                                            <Button color="error" onClick={() => remove(incIdx)}>Remove</Button>
                                          )
                                        }}
                                      />
                                    </Grid>
                                  ))}
                                  <Grid item xs={12}>
                                    <Button onClick={() => push('')} variant="outlined">Add Inclusion</Button>
                                  </Grid>
                                </Grid>
                              )}
                            </FieldArray>
                          </Grid>

                          <Grid item xs={12}>
                            <Button onClick={() => remove(index)} color="error" variant="contained">
                              Remove Itinerary
                            </Button>
                          </Grid>
                        </Grid>
                      ))}
                      <Button
                        onClick={() =>
                          push({
                            headerTag: '',
                            headerValue: '',
                            Distance: '',
                            Duration: '',
                            Altitude: '',
                            Time: '',
                            para: [],
                            images: [],
                            activity: [],
                            inclusions: [],
                          })
                        }
                        variant="contained"
                      >
                        Add Itinerary
                      </Button>
                    </>
                  )}
                </FieldArray>
              </SectionWrapper>
              <SectionWrapper title="How To Reach">
                {/* para[] as textareas */}
                <FieldArray name="details.howToReach.para">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.howToReach.para?.map((p, pIdx) => (
                        <Grid item xs={12} key={pIdx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label={`Paragraph ${pIdx + 1}`}
                            value={p}
                            onChange={(e) =>
                              setFieldValue(`details.howToReach.para[${pIdx}]`, e.target.value)
                            }
                            InputProps={{
                              endAdornment: (
                                <Button onClick={() => remove(pIdx)} color="error">Remove</Button>
                              )
                            }}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button onClick={() => push('')} variant="outlined">Add Paragraph</Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>

                {/* itineraryReach[] */}
                <FieldArray name="details.howToReach.itineraryReach">
                  {({ push, remove }) => (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Itinerary Reach</Typography>
                      {values.details.howToReach.itineraryReach?.map((reachItem, reachIdx) => (
                        <Grid container spacing={2} key={reachIdx} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 2 }}>
                          <Grid item xs={5}>
                            <TextField
                              fullWidth
                              label="Tag Name"
                              value={reachItem.tagName}
                              onChange={(e) =>
                                setFieldValue(`details.howToReach.itineraryReach[${reachIdx}].tagName`, e.target.value)
                              }
                            />
                          </Grid>

                          {/* tagValue[] inside each itineraryReach */}
                          <Grid item xs={12}>
                            {/* <Typography variant="subtitle1" sx={{ mb: 1 }}>Tag Values</Typography> */}
                            <FieldArray name={`details.howToReach.itineraryReach[${reachIdx}].tagValue`}>
                              {({ push, remove }) => (
                                <Grid container spacing={1}>
                                  {reachItem.tagValue?.map((val, valIdx) => (
                                    <Grid item xs={12} key={valIdx}>
                                      <TextField
                                        fullWidth
                                        label={`Tag Value ${valIdx + 1}`}
                                        value={val}
                                        onChange={(e) =>
                                          setFieldValue(`details.howToReach.itineraryReach[${reachIdx}].tagValue[${valIdx}]`, e.target.value)
                                        }
                                        InputProps={{
                                          endAdornment: (
                                            <Button onClick={() => remove(valIdx)} color="error">Remove</Button>
                                          )
                                        }}
                                      />
                                    </Grid>
                                  ))}
                                  <Grid item xs={12}>
                                    <Button onClick={() => push('')} variant="outlined">Add Value</Button>
                                  </Grid>
                                </Grid>
                              )}
                            </FieldArray>
                          </Grid>

                          <Grid item xs={12}>
                            <Button onClick={() => remove(reachIdx)} color="error" variant="contained">
                              Remove Itinerary Reach
                            </Button>
                          </Grid>
                        </Grid>
                      ))}
                      <Button
                        onClick={() => push({ tagName: '', tagValue: [] })}
                        variant="contained"
                      >
                        Add Itinerary Reach
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </SectionWrapper>
              <SectionWrapper title="Costing">
                {/* Single Cost */}
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <TextField
                      label="Single Cost"
                      name="details.cost.singleCost"
                      value={values.details.cost.singleCost}
                      onChange={handleChange}
                      fullWidth
                      type="number"
                    />
                  </Grid>
                </Grid>

                {/* Multiple Cost */}
                <Typography sx={{ mt: 3, mb: 3 }} > Multiple Cost (Per Pax)</Typography>
                <FieldArray name="details.cost.multipleCost">
                  {({ push, remove }) => (
                    <>
                      {values.details.cost.multipleCost.map((item, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                          <Grid item xs={6} sx={{ mb: 3 }} >
                            <TextField
                              label="Pax"
                              name={`details.cost.multipleCost[${index}].pax`}
                              value={item.pax}
                              onChange={handleChange}
                              fullWidth
                              type="number"
                            />
                          </Grid>

                          {/* Pricing inside each pax */}
                          <FieldArray name={`details.cost.multipleCost[${index}].pricing`}>
                            {({ push, remove }) => (
                              <>
                                {item.pricing?.map((priceItem, pIdx) => (
                                  <Grid container spacing={1} key={pIdx}>
                                    <Grid item xs={5}>
                                      <TextField
                                        label="Category"
                                        name={`details.cost.multipleCost[${index}].pricing[${pIdx}].catagory`}
                                        value={priceItem.catagory}
                                        onChange={handleChange}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={5}>
                                      <TextField
                                        label="Price"
                                        name={`details.cost.multipleCost[${index}].pricing[${pIdx}].price`}
                                        value={priceItem.price}
                                        onChange={handleChange}
                                        type="number"
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <Button onClick={() => remove(pIdx)} color="error">Remove</Button>
                                    </Grid>
                                  </Grid>
                                ))}
                                <Grid item xs={12}>
                                  <Button onClick={() => push({ catagory: '', price: '' })}>Add Pricing</Button>
                                </Grid>
                              </>
                            )}
                          </FieldArray>

                          <Grid item xs={12}>
                            <Button onClick={() => remove(index)} color="error" variant="outlined">Remove Cost Option</Button>
                          </Grid>
                        </Grid>
                      ))}
                      <Button onClick={() => push({ pax: '', pricing: [] })}>Add Cost Option</Button>
                    </>
                  )}
                </FieldArray>

                {/* Days Cost */}
                <Typography sx={{ mt: 3, mb: 3 }}>Days Based Costing</Typography>
                <FieldArray name="details.cost.daysCost">
                  {({ push, remove }) => (
                    <>
                      {values.details.cost.daysCost?.map((dayItem, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                          <Grid item xs={6} sx={{ mb: 3 }} >
                            <TextField
                              label="Days"
                              name={`details.cost.daysCost[${index}].days`}
                              value={dayItem.days}
                              onChange={handleChange}
                              fullWidth
                              type="number"
                            />
                          </Grid>

                          <FieldArray name={`details.cost.daysCost[${index}].pricing`}>
                            {({ push, remove }) => (
                              <>
                                {dayItem.pricing?.map((pItem, pIdx) => (
                                  <Grid container spacing={1} key={pIdx}>
                                    <Grid item xs={5}>
                                      <TextField
                                        label="Category"
                                        name={`details.cost.daysCost[${index}].pricing[${pIdx}].catagory`}
                                        value={pItem.catagory}
                                        onChange={handleChange}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={5}>
                                      <TextField
                                        label="Price"
                                        name={`details.cost.daysCost[${index}].pricing[${pIdx}].price`}
                                        value={pItem.price}
                                        onChange={handleChange}
                                        type="number"
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <Button onClick={() => remove(pIdx)} color="error">Remove</Button>
                                    </Grid>
                                  </Grid>
                                ))}
                                <Grid item xs={12}>
                                  <Button onClick={() => push({ catagory: '', price: '' })}>Add Pricing</Button>
                                </Grid>
                              </>
                            )}
                          </FieldArray>

                          <Grid item xs={12}>
                            <Button onClick={() => remove(index)} color="error" variant="outlined">Remove Day Cost</Button>
                          </Grid>
                        </Grid>
                      ))}
                      <Button onClick={() => push({ days: '', pricing: [] })}>Add Day Cost</Button>
                    </>
                  )}
                </FieldArray>

                {/* Value Cost */}
                <Typography sx={{ mt: 4, mb: 1 }}>Value-Based Cost</Typography>
                <FieldArray name="details.cost.valueCost">
                  {({ push, remove }) => (
                    <>
                      {values.details.cost.valueCost?.map((valItem, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                          <Grid item xs={4}>
                            <TextField
                              label="Type"
                              name={`details.cost.valueCost[${index}].type`}
                              value={valItem.type}
                              onChange={handleChange}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              label="Price"
                              name={`details.cost.valueCost[${index}].price`}
                              value={valItem.price}
                              onChange={handleChange}
                              fullWidth
                              type="number"
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <Button onClick={() => remove(index)} color="error">Remove</Button>
                          </Grid>
                        </Grid>
                      ))}
                      <Button onClick={() => push({ type: '', price: '' })}>Add Value Cost</Button>
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