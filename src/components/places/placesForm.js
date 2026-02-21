import { useState, Fragment } from 'react';
import { Formik, FieldArray, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Button, Grid, TextField, Typography, Switch, FormControlLabel, Paper, Divider, Chip, Stack,
  MenuItem,
  Checkbox,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import useSnackbar from '../../hooks/useSnackbar';
import { useSelector } from 'react-redux';

import _ from 'lodash';
import { insertPlace, updatePlace } from '../../api/placeApi';
import { useNavigate } from 'react-router-dom';

const getInitialValues = (data) => {
  const newData = {
    disabled: false,
    description: '',
    isActive: false,
    tags: [],
    zone: '',
    altitude: '',
    min_temperature: '',
    max_temperature: '',
    price: 0,
    offer_price: 0,
    url: '',
    name: '',
    meta: { title: '', description: '', keywords: [] },
    details: {
      header: { h1: '', h2: '', h3: '' },
      overview: [{ tagName: '', tagValue: '' }],
      expect: [''],
      best_time_to_visit: { description: [""], details: [{ months: "", weather: "", footfall: "", catagory: "", best_for: "" }] },
      how_to_reach: { description: [""], details: [{ name: "", description: "" }] },
      weather: { description: [""], details: [{ season: "", temperature: "", weather: "", best_activity: "" }] },
      geography: [''],
      attraction_and_activites: {
        description: [""], attraction: [{ name: "", description: "" }], activity: [{ name: "", description: "" }]
      },
      experiences: {
        description: "",
        details: [
          {
            name: "",
            description: "",
            images: [""]
          }
        ]
      },
      accommdations: { description: [""], details: [{ category: "", best_stay: "", price_range: "", features: "", best_for: "" }] },
      is_homestay: {
        active: false,
        description: "",
        stays: [""]
      },
      is_hotel: {
        active: false,
        description: "",
        stays: [""]
      },
      is_resort: {
        active: false,
        description: "",
        stays: [""]
      },
      conclusion: [''],
      guideLines: [''],
      faqs: [{ question: "", answer: "" }],
    }
  };
  if (data) {
    return _.merge({}, newData, data);
  }

  return newData;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  label: Yup.string().required('label is required'),
})
const SectionWrapper = ({ title, children }) => (
  <Grid item xs={12} component={Paper} elevation={2} sx={{ p: 2, mb: 3 }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Grid>
);

const RenderEditableList = ({ name, values, setFieldValue, label }) => {
  const [inputValue, setInputValue] = useState('');
  const [editIndex, setEditIndex] = useState(null);

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

const PlacesForm = () => {
  const navigate = useNavigate();
  const { fetchSelectedPlace: selectedPlace } = useSelector((state) => state.place);
  // const getInitialValues = (selectedPlace) => selectedPlace || initialValues;

  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const handleSubmit = async (values) => {

    try {
      // let res;
      if (selectedPlace && selectedPlace._id) {
        const res = await updatePlace(values, selectedPlace._id); // You'll need to import and define this API
        if (res) {
          showSnackbar('Package updated successfully', 'success');

        }
      } else {
        const res = await insertPlace(values); // You'll need to import and define this API

        if (res) {
          showSnackbar('You created a new place', 'success');
          navigate(`/places/view`);
        }


      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar('Something went wrong', 'error');
    }
  };

  const Region_obj = [
    {
      label: "None",
      val: "",
    },
    {
      label: "Sikkim",
      val: "sikkim",
    },
    {
      label: "Darjeeling",
      val: "darjeeling",
    },
    // {
    //   label: "North Sikkim",
    //   val: "north-sikkim",
    // },
    {
      label: "Meghalaya",
      val: "meghalaya",
    },
    {
      label: "Arunachal Pradesh",
      val: "arunachal-pradesh",
    }
  ]


  return (<>
    <Formik
      initialValues={getInitialValues(selectedPlace)}
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
            <Typography variant={"h4"}>
              {selectedPlace && selectedPlace._id ? 'Update Place' : 'Create a New Place'}
            </Typography>
            <Button variant="contained" type="submit" form="package-form">{selectedPlace && selectedPlace._id ? 'Update' : 'Create'}</Button>
          </Box>
          <Form id="package-form">
            <Grid container spacing={2} sx={{ p: 2 }}>

              <SectionWrapper title="Basic Info" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {/* <Grid item xs={3}><FormControlLabel control={<Switch name="disabled" checked={values.disabled} onChange={handleChange} />} label="Disabled" /></Grid> */}
                  <Grid item xs={3}><FormControlLabel control={<Switch name="isActive" checked={values.isActive} onChange={handleChange} />} label="Is Active" /></Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">Region</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={values.zone}
                        label="Region"
                        onChange={handleChange}
                        name='zone'
                      >
                        {Region_obj.map((obj) => <MenuItem key={obj.val} value={obj.val}>{obj.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Altitude"
                      name="altitude"
                      value={values.altitude}
                      onChange={handleChange}
                      error={touched.altitude && Boolean(errors.altitude)}
                      helperText={touched.altitude && errors.altitude}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Price"
                      name="price"
                      value={values.price}
                      onChange={handleChange}
                      error={touched.price && Boolean(errors.price)}
                      helperText={touched.price && errors.price}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Offer Price"
                      name="offer_price"
                      value={values.offer_price}
                      onChange={handleChange}
                      error={touched.offer_price && Boolean(errors.offer_price)}
                      helperText={touched.offer_price && errors.offer_price}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Min Temperature"
                      name="min_temperature"
                      value={values.min_temperature}
                      onChange={handleChange}
                      error={touched.min_temperature && Boolean(errors.min_temperature)}
                      helperText={touched.min_temperature && errors.min_temperature}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Max Temperature"
                      name="max_temperature"
                      value={values.max_temperature}
                      onChange={handleChange}
                      error={touched.max_temperature && Boolean(errors.max_temperature)}
                      helperText={touched.max_temperature && errors.max_temperature}
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
                      label="Name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
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
                  <Grid item xs={12}><TextField label="Description" name="description" value={values.description} onChange={handleChange} fullWidth /></Grid>

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
              <SectionWrapper title="Tags">
                <RenderEditableList name="tags" values={values.tags} setFieldValue={setFieldValue} label="Tag" />
              </SectionWrapper>
              <SectionWrapper title="What To Expect">
                {/* para[] as textareas */}
                <FieldArray name="details.expect">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.expect?.map((p, pIdx) => (
                        <Grid item xs={12} key={pIdx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label={`Paragraph ${pIdx + 1}`}
                            value={p}
                            onChange={(e) =>
                              setFieldValue(`details.expect[${pIdx}]`, e.target.value)
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
              </SectionWrapper>
              <SectionWrapper title="Best Time to Visit">
                {/* Description Paragraphs */}
                <FieldArray name="details.best_time_to_visit.description">
                  {({ push, remove }) => (
                    <Grid container spacing={2} mb={2}>
                      {values.details.best_time_to_visit.description?.map((desc, idx) => (
                        <Grid item xs={12} key={idx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label={`Description Paragraph ${idx + 1}`}
                            value={desc}
                            onChange={(e) =>
                              setFieldValue(`details.best_time_to_visit.description[${idx}]`, e.target.value)
                            }
                            InputProps={{
                              endAdornment: (
                                <Button onClick={() => remove(idx)} color="error">
                                  Remove
                                </Button>
                              )
                            }}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => push("")}>
                          Add Description Paragraph
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>

                {/* Monthly Details */}
                <FieldArray name="details.best_time_to_visit.details">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.best_time_to_visit.details?.map((item, index) => (
                        <Fragment key={index}>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              name={`details.best_time_to_visit.details[${index}].months`}
                              label="Months"
                              fullWidth
                              value={item.months}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              name={`details.best_time_to_visit.details[${index}].weather`}
                              label="Weather"
                              fullWidth
                              value={item.weather}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              name={`details.best_time_to_visit.details[${index}].footfall`}
                              label="Footfall"
                              fullWidth
                              value={item.footfall}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              name={`details.best_time_to_visit.details[${index}].catagory`}
                              label="Category"
                              fullWidth
                              value={item.catagory}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              name={`details.best_time_to_visit.details[${index}].best_for`}
                              label="Best For"
                              fullWidth
                              value={item.best_for}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} display="flex" alignItems="center">
                            <Button onClick={() => remove(index)} color="error">
                              Remove
                            </Button>
                          </Grid>
                        </Fragment>
                      ))}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          onClick={() => push({ months: "", weather: "", footfall: "", catagory: "", best_for: "" })}
                        >
                          Add Time Detail
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>
              </SectionWrapper>
              <SectionWrapper title="How to Reach">
                {/* Description Paragraphs */}
                <FieldArray name="details.how_to_reach.description">
                  {({ push, remove }) => (
                    <Grid container spacing={2} mb={2}>
                      {values.details.how_to_reach.description?.map((desc, idx) => (
                        <Grid item xs={12} key={idx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label={`Description Paragraph ${idx + 1}`}
                            value={desc}
                            onChange={(e) =>
                              setFieldValue(`details.how_to_reach.description[${idx}]`, e.target.value)
                            }
                            InputProps={{
                              endAdornment: (
                                <Button onClick={() => remove(idx)} color="error">
                                  Remove
                                </Button>
                              )
                            }}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => push("")}>
                          Add Description Paragraph
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>

                {/* Details List (Name + Description) */}
                <FieldArray name="details.how_to_reach.details">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.how_to_reach.details?.map((item, index) => (
                        <Fragment key={index}>
                          <Grid item xs={12} sm={5}>
                            <TextField
                              name={`details.how_to_reach.details[${index}].name`}
                              label="Name"
                              fullWidth
                              value={item.name}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name={`details.how_to_reach.details[${index}].description`}
                              label="Description"
                              fullWidth
                              multiline
                              minRows={2}
                              value={item.description}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} display="flex" alignItems="center">
                            <Button onClick={() => remove(index)} color="error">
                              Remove
                            </Button>
                          </Grid>
                        </Fragment>
                      ))}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          onClick={() => push({ name: "", description: "" })}
                        >
                          Add How to Reach Option
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>
              </SectionWrapper>
              <SectionWrapper title="Weather Information">
                {/* Weather Description Paragraphs */}
                <FieldArray name="details.weather.description">
                  {({ push, remove }) => (
                    <Grid container spacing={2} mb={2}>
                      {values.details.weather?.description?.map((desc, idx) => (
                        <Grid item xs={12} key={idx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label={`Weather Description ${idx + 1}`}
                            value={desc}
                            onChange={(e) =>
                              setFieldValue(`details.weather.description[${idx}]`, e.target.value)
                            }
                            InputProps={{
                              endAdornment: (
                                <Button onClick={() => remove(idx)} color="error">Remove</Button>
                              ),
                            }}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => push("")}>
                          Add Description
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>

                {/* Weather Details Grid */}
                <FieldArray name="details.weather.details">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.weather?.details?.map((entry, index) => (
                        <Fragment key={index}>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              name={`details.weather.details[${index}].season`}
                              label="Season"
                              fullWidth
                              value={entry.season}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              name={`details.weather.details[${index}].temperature`}
                              label="Temperature"
                              fullWidth
                              value={entry.temperature}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              name={`details.weather.details[${index}].weather`}
                              label="Weather"
                              fullWidth
                              value={entry.weather}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              name={`details.weather.details[${index}].best_activity`}
                              label="Best Activity"
                              fullWidth
                              value={entry.best_activity}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} display="flex" alignItems="center">
                            <Button onClick={() => remove(index)} color="error">
                              Remove
                            </Button>
                          </Grid>
                        </Fragment>
                      ))}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          onClick={() => push({ season: "", temperature: "", weather: "", best_activity: "" })}
                        >
                          Add Weather Detail
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>
              </SectionWrapper>
              <SectionWrapper title="Geography">
                {/* para[] as textareas */}
                <FieldArray name="details.geography">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.geography?.map((p, pIdx) => (
                        <Grid item xs={12} key={pIdx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label={`Paragraph ${pIdx + 1}`}
                            value={p}
                            onChange={(e) =>
                              setFieldValue(`details.geography[${pIdx}]`, e.target.value)
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
              </SectionWrapper>
              <SectionWrapper title="Attractions and Activities">
                {/* General Descriptions */}
                <FieldArray name="details.attraction_and_activites.description">
                  {({ push, remove }) => (
                    <Grid container spacing={2} mb={2}>
                      {values.details.attraction_and_activites?.description?.map((desc, idx) => (
                        <Grid item xs={12} key={idx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label={`Paragraph ${idx + 1}`}
                            value={desc}
                            onChange={(e) =>
                              setFieldValue(`details.attraction_and_activites.description[${idx}]`, e.target.value)
                            }
                            InputProps={{
                              endAdornment: (
                                <Button onClick={() => remove(idx)} color="error">Remove</Button>
                              ),
                            }}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => push("")}>
                          Add Description
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>

                {/* Attractions */}
                <Typography variant="subtitle1" mt={2}>Attractions</Typography>
                <FieldArray name="details.attraction_and_activites.attraction">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.attraction_and_activites?.attraction?.map((item, index) => (
                        <Fragment key={index}>
                          <Grid item xs={12} sm={5}>
                            <TextField
                              name={`details.attraction_and_activites.attraction[${index}].name`}
                              label="Attraction Name"
                              fullWidth
                              value={item.name}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name={`details.attraction_and_activites.attraction[${index}].description`}
                              label="Description"
                              fullWidth
                              multiline
                              minRows={2}
                              value={item.description}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} display="flex" alignItems="center">
                            <Button onClick={() => remove(index)} color="error">Remove</Button>
                          </Grid>
                        </Fragment>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => push({ name: "", description: "" })}>
                          Add Attraction
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>

                {/* Activities */}
                <Typography variant="subtitle1" mt={2}>Activities</Typography>
                <FieldArray name="details.attraction_and_activites.activity">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.attraction_and_activites?.activity?.map((item, index) => (
                        <Fragment key={index}>
                          <Grid item xs={12} sm={5}>
                            <TextField
                              name={`details.attraction_and_activites.activity[${index}].name`}
                              label="Activity Name"
                              fullWidth
                              value={item.name}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name={`details.attraction_and_activites.activity[${index}].description`}
                              label="Description"
                              fullWidth
                              multiline
                              minRows={2}
                              value={item.description}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} display="flex" alignItems="center">
                            <Button onClick={() => remove(index)} color="error">Remove</Button>
                          </Grid>
                        </Fragment>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => push({ name: "", description: "" })}>
                          Add Activity
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>
              </SectionWrapper>
              <SectionWrapper title="Experiences">
                {/* Experience Description */}
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Experiences Overview"
                      name="details.experiences.description"
                      value={values.details.experiences?.description || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>

                {/* Experience Details Array */}
                <FieldArray name="details.experiences.details">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.experiences?.details?.map((item, index) => (
                        <Fragment key={index}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              name={`details.experiences.details[${index}].name`}
                              label="Experience Title"
                              fullWidth
                              value={item.name}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name={`details.experiences.details[${index}].description`}
                              label="Experience Description"
                              multiline
                              minRows={2}
                              fullWidth
                              value={item.description}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2} display="flex" alignItems="center">
                            <Button onClick={() => remove(index)} color="error">
                              Remove
                            </Button>
                          </Grid>

                          {/* Image Links Array */}
                          <Grid item xs={12}>
                            <FieldArray name={`details.experiences.details[${index}].images`}>
                              {({ push: pushImg, remove: removeImg }) => (
                                <Grid container spacing={1}>
                                  {item.images?.map((img, imgIdx) => (
                                    <Grid item xs={12} sm={6} key={imgIdx}>
                                      <TextField
                                        fullWidth
                                        label={`Image ${imgIdx + 1}`}
                                        value={img}
                                        onChange={(e) =>
                                          setFieldValue(`details.experiences.details[${index}].images[${imgIdx}]`, e.target.value)
                                        }
                                        InputProps={{
                                          endAdornment: (
                                            <Button onClick={() => removeImg(imgIdx)} color="error">
                                              Remove
                                            </Button>
                                          )
                                        }}
                                      />
                                    </Grid>
                                  ))}
                                  <Grid item xs={12}>
                                    <Button variant="outlined" onClick={() => pushImg("")}>
                                      Add Image
                                    </Button>
                                  </Grid>
                                </Grid>
                              )}
                            </FieldArray>
                          </Grid>
                        </Fragment>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => push({ name: "", description: "", images: [""] })}>
                          Add Experience
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>
              </SectionWrapper>

              <SectionWrapper title="Accommodations">
                {/* Description Paragraphs */}
                <FieldArray name="details.accommdations.description">
                  {({ push, remove }) => (
                    <Grid container spacing={2} mb={2}>
                      {values.details.accommdations.description?.map((desc, idx) => (
                        <Grid item xs={12} key={idx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label={`Description Paragraph ${idx + 1}`}
                            value={desc}
                            onChange={(e) =>
                              setFieldValue(`details.accommdations.description[${idx}]`, e.target.value)
                            }
                            InputProps={{
                              endAdornment: (
                                <Button onClick={() => remove(idx)} color="error">
                                  Remove
                                </Button>
                              )
                            }}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => push("")}>
                          Add Description Paragraph
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>

                {/* Accommodation Details */}
                <FieldArray name="details.accommdations.details">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.accommdations.details?.map((item, index) => (
                        <Fragment key={index}>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              name={`details.accommdations.details[${index}].category`}
                              label="Category"
                              fullWidth
                              value={item.category}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              name={`details.accommdations.details[${index}].best_stay`}
                              label="Best Stay"
                              fullWidth
                              value={item.best_stay}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              name={`details.accommdations.details[${index}].price_range`}
                              label="Price Range"
                              fullWidth
                              value={item.price_range}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              name={`details.accommdations.details[${index}].features`}
                              label="Features"
                              fullWidth
                              value={item.features}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              name={`details.accommdations.details[${index}].best_for`}
                              label="Best For"
                              fullWidth
                              value={item.best_for}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} display="flex" alignItems="center">
                            <Button onClick={() => remove(index)} color="error">
                              Remove
                            </Button>
                          </Grid>
                        </Fragment>
                      ))}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            push({
                              category: "",
                              best_stay: "",
                              price_range: "",
                              features: "",
                              best_for: ""
                            })
                          }
                        >
                          Add Accommodation Detail
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>
              </SectionWrapper>

              <SectionWrapper title="Conclusions">
                {/* para[] as textareas */}
                <FieldArray name="details.conclusion">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.conclusion?.map((p, pIdx) => (
                        <Grid item xs={12} key={pIdx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label={`Paragraph ${pIdx + 1}`}
                            value={p}
                            onChange={(e) =>
                              setFieldValue(`details.conclusion[${pIdx}]`, e.target.value)
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
              </SectionWrapper>
              <SectionWrapper title="Accommodation Types">
                {/* Homestay */}
                <Typography variant="subtitle1" gutterBottom>Homestay</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="details.is_homestay.active"
                          checked={values.details.is_homestay?.active || false}
                          onChange={handleChange}
                        />
                      }
                      label="Is Active"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      name="details.is_homestay.description"
                      label="Homestay Description"
                      fullWidth
                      multiline
                      minRows={2}
                      value={values.details.is_homestay?.description || ""}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* Homestay Stays */}
                  <Grid item xs={12}>
                    <FieldArray name="details.is_homestay.stays">
                      {({ push, remove }) => (
                        <Grid container spacing={2}>
                          {values.details.is_homestay?.stays?.map((stay, idx) => (
                            <Grid item xs={12} sm={6} key={idx}>
                              <TextField
                                fullWidth
                                label={`Homestay Stay ${idx + 1}`}
                                value={stay}
                                onChange={(e) =>
                                  setFieldValue(`details.is_homestay.stays[${idx}]`, e.target.value)
                                }
                                InputProps={{
                                  endAdornment: (
                                    <Button onClick={() => remove(idx)} color="error">Remove</Button>
                                  ),
                                }}
                              />
                            </Grid>
                          ))}
                          <Grid item xs={12}>
                            <Button variant="outlined" onClick={() => push("")}>
                              Add Homestay Stay
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                    </FieldArray>
                  </Grid>
                </Grid>

                {/* Hotel */}
                <Typography variant="subtitle1" mt={3} gutterBottom>Hotel</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="details.is_hotel.active"
                          checked={values.details.is_hotel?.active || false}
                          onChange={handleChange}
                        />
                      }
                      label="Is Active"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      name="details.is_hotel.description"
                      label="Hotel Description"
                      fullWidth
                      multiline
                      minRows={2}
                      value={values.details.is_hotel?.description || ""}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* Hotel Stays */}
                  <Grid item xs={12}>
                    <FieldArray name="details.is_hotel.stays">
                      {({ push, remove }) => (
                        <Grid container spacing={2}>
                          {values.details.is_hotel?.stays?.map((stay, idx) => (
                            <Grid item xs={12} sm={6} key={idx}>
                              <TextField
                                fullWidth
                                label={`Hotel Stay ${idx + 1}`}
                                value={stay}
                                onChange={(e) =>
                                  setFieldValue(`details.is_hotel.stays[${idx}]`, e.target.value)
                                }
                                InputProps={{
                                  endAdornment: (
                                    <Button onClick={() => remove(idx)} color="error">Remove</Button>
                                  ),
                                }}
                              />
                            </Grid>
                          ))}
                          <Grid item xs={12}>
                            <Button variant="outlined" onClick={() => push("")}>
                              Add Hotel Stay
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                    </FieldArray>
                  </Grid>
                </Grid>

                {/* Resort */}
                <Typography variant="subtitle1" mt={3} gutterBottom>Resort</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="details.is_resort.active"
                          checked={values.details.is_resort?.active || false}
                          onChange={handleChange}
                        />
                      }
                      label="Is Active"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      name="details.is_resort.description"
                      label="Resort Description"
                      fullWidth
                      multiline
                      minRows={2}
                      value={values.details.is_resort?.description || ""}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* Resort Stays */}
                  <Grid item xs={12}>
                    <FieldArray name="details.is_resort.stays">
                      {({ push, remove }) => (
                        <Grid container spacing={2}>
                          {values.details.is_resort?.stays?.map((stay, idx) => (
                            <Grid item xs={12} sm={6} key={idx}>
                              <TextField
                                fullWidth
                                label={`Resort Stay ${idx + 1}`}
                                value={stay}
                                onChange={(e) =>
                                  setFieldValue(`details.is_resort.stays[${idx}]`, e.target.value)
                                }
                                InputProps={{
                                  endAdornment: (
                                    <Button onClick={() => remove(idx)} color="error">Remove</Button>
                                  ),
                                }}
                              />
                            </Grid>
                          ))}
                          <Grid item xs={12}>
                            <Button variant="outlined" onClick={() => push("")}>
                              Add Resort Stay
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                    </FieldArray>
                  </Grid>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Pro Tips(guideLines)">
                {/* para[] as textareas */}
                <FieldArray name="details.guideLines">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.guideLines?.map((p, pIdx) => (
                        <Grid item xs={12} key={pIdx}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label={`Paragraph ${pIdx + 1}`}
                            value={p}
                            onChange={(e) =>
                              setFieldValue(`details.guideLines[${pIdx}]`, e.target.value)
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
              </SectionWrapper>
              <SectionWrapper title="Frequently Asked Questions (FAQs)">
                <FieldArray name="details.faqs">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.faqs?.map((faq, index) => (
                        <Fragment key={index}>
                          <Grid item xs={12} sm={5}>
                            <TextField
                              name={`details.faqs[${index}].question`}
                              label={`Question ${index + 1}`}
                              fullWidth
                              value={faq.question}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name={`details.faqs[${index}].answer`}
                              label="Answer"
                              multiline
                              minRows={2}
                              fullWidth
                              value={faq.answer}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} display="flex" alignItems="center">
                            <Button onClick={() => remove(index)} color="error">Remove</Button>
                          </Grid>
                        </Fragment>
                      ))}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          onClick={() => push({ question: "", answer: "" })}
                        >
                          Add FAQ
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>
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

export default PlacesForm;