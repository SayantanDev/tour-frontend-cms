import React from 'react';
import { Formik, FieldArray, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Button, Grid, TextField, Typography, Switch, FormControlLabel, Paper, Divider, Chip, Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import useSnackbar from '../../hooks/useSnackbar';
import { useSelector } from 'react-redux';

import _ from 'lodash';
import { CatPackageCreate, updateCatPackage } from '../../api/catPackageAPI';
import { useNavigate } from 'react-router-dom';

const getInitialValues = (data) => {
  const newData = {
    name: '',
    images: [],
    label: '',
    url: '',
    zone: '',
    description: '',
    price: 0,
    offer_price: 0,
    category: '',
    package_usage_type: '',
    popular_destination_covered: [{ name: '', image: '' }],
    popular_attraction_covered: [{ name: '', image: '' }],
    addi_destination_covered: [{ name: '', image: '' }],
    addi_attraction_covered: [{ name: '', image: '' }],
    meta: { title: '', description: '', keywords: [] },
    tags: [],
    is_active: true,
    disable: false,
    details: {
      header: { h1: '', h2: '', h3: '', h4: '' },
      overview: [{ name: '', description: '' }],
      packages: { description: [''], package_ids: [] },
      intro: [''],
      why_choose: { title: '', description: [''], details: [''] },
      what_to_peek: { title: '', description: [''], details: [''] },
      what_makes: { title: '', description: [''], details: [{ name: '', description: '' }] },
      activity: { title: '', description: [''], details: [{ name: '', description: [''] }] },
      best_places: {
        title: '',
        description: [''],
        details: {
          columns: [''],
          data: [{}],
        },
      },
      things_to_do: {
        title: '',
        description: [''],
        details: [{ name: '', description: '' }],
      },
      bring_back: {
        title: '',
        description: [''],
        details: [''],
      },
      photogenic_spots: {
        title: '',
        description: [''],
        details: [{ name: '', description: [''] }],
      },
      itinerary: {
        title: '',
        description: [''],
        details: {
          columns: [''],
          data: [{}],
        },
        includes: [''],
        excludes: [''],
      },
      how_to_reach: {
        title: '',
        description: [''],
        details: [{ name: '', description: '' }],
      },
      food_to_try: {
        title: '',
        description: [''],
        details: {
          columns: [''],
          data: [{}],
        },
      },
      best_time_to_visit: {
        title: '',
        description: [''],
        details: {
          columns: [''],
          data: [{}],
        },
      },
      accommodations: {
        title: '',
        description: [''],
        details: {
          columns: [''],
          data: [{}],
        },
      },
      is_homestay: {
        active: false,
        title: '',
        description: [''],
        stays_details: {
          columns: [''],
          data: [{}],
        },
      },
      is_hotel: {
        active: false,
        title: '',
        description: [''],
        stays_details: {
          columns: [''],
          data: [{}],
        },
      },
      is_resort: {
        active: false,
        title: '',
        description: [''],
        stays_details: {
          columns: [''],
          data: [{}],
        },
      },
      conclusion: [''],
      faqs: [{ question: '', answer: '' }],
      guideLines: {
        title: '',
        description: [''],
        details: [''],
      },
      stay_cautious_about: {
        title: '',
        description: [''],
        details: [{ name: '', description: '' }],
      },
    },
    created_at: '',
    updated_at: '',
  };

  return data ? _.merge({}, newData, data) : newData;
};

const package_usage_types_obj = [
  {
    label: "None",
    val: "",
  },
  {
    label: "Home page attraction",
    val: "home-page-attraction",
  },
  {
    label: "Attraction",
    val: "attraction",
  },
  {
    label: "Tour Category",
    val: "tour-category",
  },
  {
    label: "Home Page Tour Category",
    val: "home-page-tour-category",
  },
  {
    label: "Trek Category",
    val: "trek-category",
  },
  {
    label: "Home Page Trek Category",
    val: "home-page-trek-category",
  },
  {
    label: "Places Category",
    val: "places-category",
  },
  {
    label: "Home Page Places Category",
    val: "home-page-places-category",
  },
]

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
  {
    label: "North Sikkim",
    val: "north-sikkim",
  },
  {
    label: "Meghalaya",
    val: "meghalaya",
  },
  {
    label: "Arunachal Pradesh",
    val: "arunachal-pradesh",
  }
]

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  label: Yup.string().required('label is required'),
  url: Yup.string().required('URL is required'),
});
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

const CtgForm = () => {
  const navigate = useNavigate();
  const { fetchSelectedCtgPackage: selectedCatPackage } = useSelector((state) => state.ctgpakage);

  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const handleSubmit = async (values) => {
    try {
      // let res;
      if (selectedCatPackage && selectedCatPackage._id) {

        const res = await updateCatPackage(selectedCatPackage._id, values); // You'll need to import and define this API
        if (res) {
          showSnackbar('Package updated successfully', 'success');
        }
      } else {
        await CatPackageCreate(values);
        showSnackbar('You created a new place', 'success');
        navigate(`/category-packages/view`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar('Something went wrong', 'error');
    }
  };
  return (<>
    <Formik
      initialValues={getInitialValues(selectedCatPackage)}
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
              {selectedCatPackage && selectedCatPackage._id ? 'Update Ctg-package' : 'Create a New Ctg-package'}
            </Typography>
            <Button variant="contained" type="submit" form="package-form">{selectedCatPackage && selectedCatPackage._id ? 'Update' : 'Create'}</Button>
          </Box>
          <Form id="package-form">
            <Grid container spacing={2} sx={{ p: 2 }}>

              <SectionWrapper title="Basic Info" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
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
                      multiline
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
                      label="Category"
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                      error={touched.category && Boolean(errors.category)}
                      helperText={touched.category && errors.category}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Price"
                      name="price"
                      type="number"
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
                      type="number"
                      value={values.offer_price}
                      onChange={handleChange}
                      error={touched.offer_price && Boolean(errors.offer_price)}
                      helperText={touched.offer_price && errors.offer_price}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">Package Usage Type</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={values.package_usage_type}
                        label="Package Usage Type"
                        onChange={handleChange}
                        name='package_usage_type'
                      >
                        {package_usage_types_obj.map((obj) => <MenuItem key={obj.val} value={obj.val}>{obj.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      name="description"
                      multiline
                      minRows={3}
                      value={values.description}
                      onChange={handleChange}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Popular Destination Covered" sx={{ mt: 4 }}>
                <RenderEditableList
                  name="popular_destination_covered"
                  values={values.popular_destination_covered.map((item) => item.name)}
                  label="Destination"
                  setFieldValue={(field, updatedNames) => {
                    const updatedList = updatedNames.map((name) => ({ name }));
                    setFieldValue(field, updatedList);
                  }}
                />
              </SectionWrapper>
              <SectionWrapper title="Popular Attraction Covered" sx={{ mt: 4 }}>
                <RenderEditableList
                  name="popular_attraction_covered"
                  values={values.popular_attraction_covered.map((item) => item.name)}
                  label="Attraction"
                  setFieldValue={(field, updatedNames) => {
                    const updatedList = updatedNames.map((name) => ({ name }));
                    setFieldValue(field, updatedList);
                  }}
                />
              </SectionWrapper>
              <SectionWrapper title="Additional Destination Covered" sx={{ mt: 4 }}>
                <RenderEditableList
                  name="addi_destination_covered"
                  values={values.addi_destination_covered.map((item) => item.name)}
                  label="Destination"
                  setFieldValue={(field, updatedNames) => {
                    const updatedList = updatedNames.map((name) => ({ name }));
                    setFieldValue(field, updatedList);
                  }}
                />
              </SectionWrapper>
              <SectionWrapper title="Additional Attraction Covered" sx={{ mt: 4 }}>
                <RenderEditableList
                  name="addi_attraction_covered"
                  values={values.addi_attraction_covered.map((item) => item.name)}
                  label="Attraction"
                  setFieldValue={(field, updatedNames) => {
                    const updatedList = updatedNames.map((name) => ({ name }));
                    setFieldValue(field, updatedList);
                  }}
                />
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
                  <Grid item xs={12}><TextField label="Meta Description" name="meta.description" value={values.meta.description} onChange={handleChange} fullWidth multiline /></Grid>
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
              <SectionWrapper title="Intro" sx={{ mt: 4 }}>
                <FieldArray name="details.intro">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.intro.map((introPoint, index) => (
                        <Grid item xs={12} key={index} sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            label={`Intro Point ${index + 1}`}
                            name={`details.intro[${index}]`}
                            value={values.details.intro[index]}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            error={
                              touched.details?.intro?.[index] &&
                              Boolean(errors.details?.intro?.[index])
                            }
                            helperText={
                              touched.details?.intro?.[index] &&
                              errors.details?.intro?.[index]
                            }
                          />
                          <Button
                            onClick={() => remove(index)}
                            color="error"
                            variant="outlined"
                            disabled={values.details.intro.length === 1}
                          >
                            Remove
                          </Button>
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={() => push('')}
                          sx={{ mt: 1 }}
                        >
                          + Add Intro Point
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </FieldArray>
              </SectionWrapper>
              <SectionWrapper title="Why Choose" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.why_choose.title"
                      value={values.details.why_choose.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.why_choose?.title &&
                        Boolean(errors.details?.why_choose?.title)
                      }
                      helperText={
                        touched.details?.why_choose?.title &&
                        errors.details?.why_choose?.title
                      }
                    />
                  </Grid>

                  {/* Description Points */}
                  <FieldArray name="details.why_choose.description">
                    {({ push, remove }) => (
                      <>
                        {values.details.why_choose.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.why_choose.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.why_choose.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Details Points */}
                  <FieldArray name="details.why_choose.details">
                    {({ push, remove }) => (
                      <>
                        {values.details.why_choose.details.map((item, index) => (
                          <Grid item xs={12} key={`why-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Point ${index + 1}`}
                              name={`details.why_choose.details[${index}]`}
                              value={item}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.why_choose.details.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Point
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="What Makes It Special" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title Field */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.what_makes.title"
                      value={values.details.what_makes.title}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      error={
                        touched.details?.what_makes?.title &&
                        Boolean(errors.details?.what_makes?.title)
                      }
                      helperText={
                        touched.details?.what_makes?.title &&
                        errors.details?.what_makes?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.what_makes.description">
                    {({ push, remove }) => (
                      <>
                        {values.details.what_makes.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.what_makes.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.what_makes.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Details Array (name + description) */}
                  <FieldArray name="details.what_makes.details">
                    {({ push, remove }) => (
                      <>
                        {values.details.what_makes.details.map((item, index) => (
                          <Grid item xs={12} key={`detail-${index}`}>
                            <Grid container spacing={2}>
                              <Grid item xs={5}>
                                <TextField
                                  label="Point Title"
                                  name={`details.what_makes.details[${index}].name`}
                                  value={item.name}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  label="Description"
                                  name={`details.what_makes.details[${index}].description`}
                                  value={item.description}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(index)}
                                  color="error"
                                  variant="outlined"
                                  disabled={values.details.what_makes.details.length === 1}
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push({ name: '', description: '' })} sx={{ mt: 1 }}>
                            + Add Detail Point
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="What to Peek" sx={{ mt: 4 }}>
                <Grid container spacing={2}>

                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.what_to_peek.title"
                      value={values.details.what_to_peek.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.what_to_peek?.title &&
                        Boolean(errors.details?.what_to_peek?.title)
                      }
                      helperText={
                        touched.details?.what_to_peek?.title &&
                        errors.details?.what_to_peek?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.what_to_peek.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Description</strong></Grid>
                        {values.details.what_to_peek.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.what_to_peek.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.what_to_peek.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Details Array */}
                  <FieldArray name="details.what_to_peek.details">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Key Highlights / Peeks</strong></Grid>
                        {values.details.what_to_peek.details.map((item, index) => (
                          <Grid item xs={12} key={`item-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Peek ${index + 1}`}
                              name={`details.what_to_peek.details[${index}]`}
                              value={item}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.what_to_peek.details.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Peek
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Activities" sx={{ mt: 4 }}>
                <Grid container spacing={2}>

                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.activity.title"
                      value={values.details.activity.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.activity?.title &&
                        Boolean(errors.details?.activity?.title)
                      }
                      helperText={
                        touched.details?.activity?.title &&
                        errors.details?.activity?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.activity.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Section Descriptions</strong></Grid>
                        {values.details.activity.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.activity.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.activity.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Activities Details: name + description[] */}
                  <FieldArray name="details.activity.details">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Activities List</strong></Grid>
                        {values.details.activity.details.map((item, index) => (
                          <Grid item xs={12} key={`act-${index}`} sx={{ mb: 2 }}>
                            <Grid container spacing={2}>
                              {/* Name */}
                              <Grid item xs={5}>
                                <TextField
                                  label="Activity Name"
                                  name={`details.activity.details[${index}].name`}
                                  value={item.name}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>

                              {/* Nested Description[] */}
                              <FieldArray name={`details.activity.details[${index}].description`}>
                                {({ push, remove }) => (
                                  <>
                                    {item.description.map((d, dIndex) => (
                                      <Grid item xs={6} key={`desc-${index}-${dIndex}`} sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                          label={`Detail ${dIndex + 1}`}
                                          name={`details.activity.details[${index}].description[${dIndex}]`}
                                          value={d}
                                          onChange={handleChange}
                                          fullWidth
                                        />
                                        <Button
                                          onClick={() => remove(dIndex)}
                                          variant="outlined"
                                          color="error"
                                          disabled={item.description.length === 1}
                                        >
                                          Remove
                                        </Button>
                                      </Grid>
                                    ))}
                                    <Grid item xs={12}>
                                      <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => push('')}
                                      >
                                        + Add Detail
                                      </Button>
                                    </Grid>
                                  </>
                                )}
                              </FieldArray>

                              {/* Remove entire activity */}
                              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() => remove(index)}
                                >
                                  Remove Activity
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}

                        {/* Add New Activity */}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push({ name: '', description: [''] })}
                            sx={{ mt: 1 }}
                          >
                            + Add Activity
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Best Places" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.best_places.title"
                      value={values.details.best_places.title}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.best_places.description">
                    {({ push, remove }) => (
                      <>
                        {values.details.best_places.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.best_places.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.best_places.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Columns (Header Titles) */}
                  <FieldArray name="details.best_places.details.columns">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Table Headers</strong></Grid>
                        {values.details.best_places.details.columns.map((col, index) => (
                          <Grid item xs={3} key={`col-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Column ${index + 1}`}
                              name={`details.best_places.details.columns[${index}]`}
                              value={col}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.best_places.details.columns.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Column
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Table Data Rows */}
                  <FieldArray name="details.best_places.details.data">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Table Data</strong></Grid>
                        {values.details.best_places.details.data.map((row, rowIndex) => (
                          <Grid item xs={12} key={`row-${rowIndex}`}>
                            <Grid container spacing={2}>
                              {values.details.best_places.details.columns.map((col, colIndex) => (
                                <Grid item xs={3} key={`col-${rowIndex}-${colIndex}`}>
                                  <TextField
                                    label={col || `Column ${colIndex + 1}`}
                                    name={`details.best_places.details.data[${rowIndex}][${col}]`}
                                    value={row[col] || ''}
                                    onChange={(e) => {
                                      const updatedRows = [...values.details.best_places.details.data];
                                      updatedRows[rowIndex] = {
                                        ...updatedRows[rowIndex],
                                        [col]: e.target.value,
                                      };
                                      setFieldValue("details.best_places.details.data", updatedRows);
                                    }}
                                    fullWidth
                                    multiline
                                  />
                                </Grid>
                              ))}
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(rowIndex)}
                                  color="error"
                                  variant="outlined"
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push({})}
                            sx={{ mt: 1 }}
                          >
                            + Add Row
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Things To Do" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title Field */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.things_to_do.title"
                      value={values.details.things_to_do.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.things_to_do?.title &&
                        Boolean(errors.details?.things_to_do?.title)
                      }
                      helperText={
                        touched.details?.things_to_do?.title &&
                        errors.details?.things_to_do?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.things_to_do.description">
                    {({ push, remove }) => (
                      <>
                        {values.details.things_to_do.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.things_to_do.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.things_to_do.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Details List (name + description) */}
                  <FieldArray name="details.things_to_do.details">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Things To Do Details</strong></Grid>
                        {values.details.things_to_do.details.map((item, index) => (
                          <Grid item xs={12} key={`todo-${index}`}>
                            <Grid container spacing={2}>
                              <Grid item xs={5}>
                                <TextField
                                  label="Activity Name"
                                  name={`details.things_to_do.details[${index}].name`}
                                  value={item.name}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  label="Description"
                                  name={`details.things_to_do.details[${index}].description`}
                                  value={item.description}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(index)}
                                  color="error"
                                  variant="outlined"
                                  disabled={values.details.things_to_do.details.length === 1}
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push({ name: '', description: '' })}
                            sx={{ mt: 1 }}
                          >
                            + Add Activity
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Things to Bring Back" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.bring_back.title"
                      value={values.details.bring_back.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.bring_back?.title &&
                        Boolean(errors.details?.bring_back?.title)
                      }
                      helperText={
                        touched.details?.bring_back?.title &&
                        errors.details?.bring_back?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.bring_back.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Descriptions</strong></Grid>
                        {values.details.bring_back.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.bring_back.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.bring_back.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Details Array */}
                  <FieldArray name="details.bring_back.details">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Items to Bring Back</strong></Grid>
                        {values.details.bring_back.details.map((item, index) => (
                          <Grid item xs={12} key={`item-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Item ${index + 1}`}
                              name={`details.bring_back.details[${index}]`}
                              value={item}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.bring_back.details.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Item
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Photogenic Spots" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.photogenic_spots.title"
                      value={values.details.photogenic_spots.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.photogenic_spots?.title &&
                        Boolean(errors.details?.photogenic_spots?.title)
                      }
                      helperText={
                        touched.details?.photogenic_spots?.title &&
                        errors.details?.photogenic_spots?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.photogenic_spots.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Section Descriptions</strong></Grid>
                        {values.details.photogenic_spots.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.photogenic_spots.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.photogenic_spots.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Photogenic Spots List with Nested Description Arrays */}
                  <FieldArray name="details.photogenic_spots.details">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Photogenic Locations</strong></Grid>
                        {values.details.photogenic_spots.details.map((spot, index) => (
                          <Grid item xs={12} key={`spot-${index}`} sx={{ mb: 2 }}>
                            <Grid container spacing={2}>
                              {/* Spot Name */}
                              <Grid item xs={5}>
                                <TextField
                                  label="Spot Name"
                                  name={`details.photogenic_spots.details[${index}].name`}
                                  value={spot.name}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>

                              {/* Description Subarray */}
                              <FieldArray name={`details.photogenic_spots.details[${index}].description`}>
                                {({ push, remove }) => (
                                  <>
                                    {spot.description.map((d, dIndex) => (
                                      <Grid item xs={6} key={`desc-${index}-${dIndex}`} sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                          label={`Description ${dIndex + 1}`}
                                          name={`details.photogenic_spots.details[${index}].description[${dIndex}]`}
                                          value={d}
                                          onChange={handleChange}
                                          fullWidth
                                          multiline
                                        />
                                        <Button
                                          onClick={() => remove(dIndex)}
                                          color="error"
                                          variant="outlined"
                                          disabled={spot.description.length === 1}
                                        >
                                          Remove
                                        </Button>
                                      </Grid>
                                    ))}
                                    <Grid item xs={12}>
                                      <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => push('')}
                                      >
                                        + Add Description to Spot
                                      </Button>
                                    </Grid>
                                  </>
                                )}
                              </FieldArray>

                              {/* Remove Entire Spot */}
                              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                  onClick={() => remove(index)}
                                  color="error"
                                  variant="outlined"
                                >
                                  Remove Spot
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push({ name: '', description: [''] })}
                            sx={{ mt: 1 }}
                          >
                            + Add Spot
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Itinerary" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.itinerary.title"
                      value={values.details.itinerary.title}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  {/* Description */}
                  <FieldArray name="details.itinerary.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Description</strong></Grid>
                        {values.details.itinerary.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.itinerary.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.itinerary.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Columns */}
                  <FieldArray name="details.itinerary.details.columns">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Table Columns</strong></Grid>
                        {values.details.itinerary.details.columns.map((col, index) => (
                          <Grid item xs={3} key={`col-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Column ${index + 1}`}
                              name={`details.itinerary.details.columns[${index}]`}
                              value={col}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.itinerary.details.columns.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Column
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Data Rows */}
                  <FieldArray name="details.itinerary.details.data">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Itinerary Rows</strong></Grid>
                        {values.details.itinerary.details.data.map((row, rowIndex) => (
                          <Grid item xs={12} key={`row-${rowIndex}`}>
                            <Grid container spacing={2}>
                              {values.details.itinerary.details.columns.map((col, colIndex) => (
                                <Grid item xs={3} key={`cell-${rowIndex}-${colIndex}`}>
                                  <TextField
                                    label={col || `Column ${colIndex + 1}`}
                                    name={`details.itinerary.details.data[${rowIndex}][${col}]`}
                                    value={row[col] || ''}
                                    onChange={(e) => {
                                      const updated = [...values.details.itinerary.details.data];
                                      updated[rowIndex] = {
                                        ...updated[rowIndex],
                                        [col]: e.target.value,
                                      };
                                      setFieldValue("details.itinerary.details.data", updated);
                                    }}
                                    fullWidth
                                    multiline
                                  />
                                </Grid>
                              ))}
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button onClick={() => remove(rowIndex)} variant="outlined" color="error">
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push({})} sx={{ mt: 1 }}>
                            + Add Row
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Includes */}
                  <FieldArray name="details.itinerary.includes">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Includes</strong></Grid>
                        {values.details.itinerary.includes.map((item, index) => (
                          <Grid item xs={12} key={`include-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Include ${index + 1}`}
                              name={`details.itinerary.includes[${index}]`}
                              value={item}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.itinerary.includes.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Include
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Excludes */}
                  <FieldArray name="details.itinerary.excludes">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Excludes</strong></Grid>
                        {values.details.itinerary.excludes.map((item, index) => (
                          <Grid item xs={12} key={`exclude-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Exclude ${index + 1}`}
                              name={`details.itinerary.excludes[${index}]`}
                              value={item}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.itinerary.excludes.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Exclude
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="How to Reach" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.how_to_reach.title"
                      value={values.details.how_to_reach.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.how_to_reach?.title &&
                        Boolean(errors.details?.how_to_reach?.title)
                      }
                      helperText={
                        touched.details?.how_to_reach?.title &&
                        errors.details?.how_to_reach?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.how_to_reach.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Descriptions</strong></Grid>
                        {values.details.how_to_reach.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.how_to_reach.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.how_to_reach.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Details: Mode of Transport */}
                  <FieldArray name="details.how_to_reach.details">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Transport Options</strong></Grid>
                        {values.details.how_to_reach.details.map((option, index) => (
                          <Grid item xs={12} key={`option-${index}`}>
                            <Grid container spacing={2}>
                              <Grid item xs={5}>
                                <TextField
                                  label="Transport Name"
                                  name={`details.how_to_reach.details[${index}].name`}
                                  value={option.name}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  label="Description"
                                  name={`details.how_to_reach.details[${index}].description`}
                                  value={option.description}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(index)}
                                  variant="outlined"
                                  color="error"
                                  disabled={values.details.how_to_reach.details.length === 1}
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push({ name: '', description: '' })}
                            sx={{ mt: 1 }}
                          >
                            + Add Transport Option
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Food to Try" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.food_to_try.title"
                      value={values.details.food_to_try.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.food_to_try?.title &&
                        Boolean(errors.details?.food_to_try?.title)
                      }
                      helperText={
                        touched.details?.food_to_try?.title &&
                        errors.details?.food_to_try?.title
                      }
                    />
                  </Grid>

                  {/* Description */}
                  <FieldArray name="details.food_to_try.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Description</strong></Grid>
                        {values.details.food_to_try.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.food_to_try.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.food_to_try.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Columns */}
                  <FieldArray name="details.food_to_try.details.columns">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Table Columns</strong></Grid>
                        {values.details.food_to_try.details.columns.map((col, index) => (
                          <Grid item xs={3} key={`col-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Column ${index + 1}`}
                              name={`details.food_to_try.details.columns[${index}]`}
                              value={col}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.food_to_try.details.columns.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Column
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Data Rows */}
                  <FieldArray name="details.food_to_try.details.data">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Food Rows</strong></Grid>
                        {values.details.food_to_try.details.data.map((row, rowIndex) => (
                          <Grid item xs={12} key={`row-${rowIndex}`}>
                            <Grid container spacing={2}>
                              {values.details.food_to_try.details.columns.map((col, colIndex) => (
                                <Grid item xs={3} key={`cell-${rowIndex}-${colIndex}`}>
                                  <TextField
                                    label={col || `Column ${colIndex + 1}`}
                                    name={`details.food_to_try.details.data[${rowIndex}][${col}]`}
                                    value={row[col] || ''}
                                    onChange={(e) => {
                                      const updated = [...values.details.food_to_try.details.data];
                                      updated[rowIndex] = {
                                        ...updated[rowIndex],
                                        [col]: e.target.value,
                                      };
                                      setFieldValue("details.food_to_try.details.data", updated);
                                    }}
                                    fullWidth
                                    multiline
                                  />
                                </Grid>
                              ))}
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(rowIndex)}
                                  variant="outlined"
                                  color="error"
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push({})} variant="outlined" sx={{ mt: 1 }}>
                            + Add Row
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Best Time to Visit" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.best_time_to_visit.title"
                      value={values.details.best_time_to_visit.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.best_time_to_visit?.title &&
                        Boolean(errors.details?.best_time_to_visit?.title)
                      }
                      helperText={
                        touched.details?.best_time_to_visit?.title &&
                        errors.details?.best_time_to_visit?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.best_time_to_visit.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Descriptions</strong></Grid>
                        {values.details.best_time_to_visit.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.best_time_to_visit.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                              multiline
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.best_time_to_visit.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Columns */}
                  <FieldArray name="details.best_time_to_visit.details.columns">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Table Columns</strong></Grid>
                        {values.details.best_time_to_visit.details.columns.map((col, index) => (
                          <Grid item xs={3} key={`col-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Column ${index + 1}`}
                              name={`details.best_time_to_visit.details.columns[${index}]`}
                              value={col}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.best_time_to_visit.details.columns.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Column
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Data Rows */}
                  <FieldArray name="details.best_time_to_visit.details.data">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Best Time Rows</strong></Grid>
                        {values.details.best_time_to_visit.details.data.map((row, rowIndex) => (
                          <Grid item xs={12} key={`row-${rowIndex}`}>
                            <Grid container spacing={2}>
                              {values.details.best_time_to_visit.details.columns.map((col, colIndex) => (
                                <Grid item xs={3} key={`cell-${rowIndex}-${colIndex}`}>
                                  <TextField
                                    label={col || `Column ${colIndex + 1}`}
                                    name={`details.best_time_to_visit.details.data[${rowIndex}][${col}]`}
                                    value={row[col] || ''}
                                    onChange={(e) => {
                                      const updated = [...values.details.best_time_to_visit.details.data];
                                      updated[rowIndex] = {
                                        ...updated[rowIndex],
                                        [col]: e.target.value,
                                      };
                                      setFieldValue("details.best_time_to_visit.details.data", updated);
                                    }}
                                    fullWidth
                                    multiline
                                  />
                                </Grid>
                              ))}
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(rowIndex)}
                                  variant="outlined"
                                  color="error"
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push({})} variant="outlined" sx={{ mt: 1 }}>
                            + Add Row
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Accommodations" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.accommodations.title"
                      value={values.details.accommodations.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.accommodations?.title &&
                        Boolean(errors.details?.accommodations?.title)
                      }
                      helperText={
                        touched.details?.accommodations?.title &&
                        errors.details?.accommodations?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.accommodations.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Descriptions</strong></Grid>
                        {values.details.accommodations.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.accommodations.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.accommodations.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Columns */}
                  <FieldArray name="details.accommodations.details.columns">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Table Columns</strong></Grid>
                        {values.details.accommodations.details.columns.map((col, index) => (
                          <Grid item xs={3} key={`col-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Column ${index + 1}`}
                              name={`details.accommodations.details.columns[${index}]`}
                              value={col}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.accommodations.details.columns.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Column
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Data Rows */}
                  <FieldArray name="details.accommodations.details.data">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Accommodation Rows</strong></Grid>
                        {values.details.accommodations.details.data.map((row, rowIndex) => (
                          <Grid item xs={12} key={`row-${rowIndex}`}>
                            <Grid container spacing={2}>
                              {values.details.accommodations.details.columns.map((col, colIndex) => (
                                <Grid item xs={3} key={`cell-${rowIndex}-${colIndex}`}>
                                  <TextField
                                    label={col || `Column ${colIndex + 1}`}
                                    name={`details.accommodations.details.data[${rowIndex}][${col}]`}
                                    value={row[col] || ''}
                                    onChange={(e) => {
                                      const updated = [...values.details.accommodations.details.data];
                                      updated[rowIndex] = {
                                        ...updated[rowIndex],
                                        [col]: e.target.value,
                                      };
                                      setFieldValue("details.accommodations.details.data", updated);
                                    }}
                                    fullWidth
                                  />
                                </Grid>
                              ))}
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(rowIndex)}
                                  variant="outlined"
                                  color="error"
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push({})} sx={{ mt: 1 }}>
                            + Add Row
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Homestay Info" sx={{ mt: 4 }}>
                <Grid container spacing={2}>

                  {/* Active Switch */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.details.is_homestay.active}
                          onChange={(e) =>
                            setFieldValue('details.is_homestay.active', e.target.checked)
                          }
                          name="details.is_homestay.active"
                        />
                      }
                      label="Enable Homestay Section"
                    />
                  </Grid>

                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Homestay Title"
                      name="details.is_homestay.title"
                      value={values.details.is_homestay.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.is_homestay?.title &&
                        Boolean(errors.details?.is_homestay?.title)
                      }
                      helperText={
                        touched.details?.is_homestay?.title &&
                        errors.details?.is_homestay?.title
                      }
                    />
                  </Grid>

                  {/* Description */}
                  <FieldArray name="details.is_homestay.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Description</strong></Grid>
                        {values.details.is_homestay.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.is_homestay.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.is_homestay.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Columns */}
                  <FieldArray name="details.is_homestay.stays_details.columns">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Table Columns</strong></Grid>
                        {values.details.is_homestay.stays_details.columns.map((col, index) => (
                          <Grid item xs={3} key={`col-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Column ${index + 1}`}
                              name={`details.is_homestay.stays_details.columns[${index}]`}
                              value={col}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.is_homestay.stays_details.columns.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Column
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Data Rows */}
                  <FieldArray name="details.is_homestay.stays_details.data">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Homestay Rows</strong></Grid>
                        {values.details.is_homestay.stays_details.data.map((row, rowIndex) => (
                          <Grid item xs={12} key={`row-${rowIndex}`}>
                            <Grid container spacing={2}>
                              {values.details.is_homestay.stays_details.columns.map((col, colIndex) => (
                                <Grid item xs={3} key={`cell-${rowIndex}-${colIndex}`}>
                                  <TextField
                                    label={col || `Column ${colIndex + 1}`}
                                    name={`details.is_homestay.stays_details.data[${rowIndex}][${col}]`}
                                    value={row[col] || ''}
                                    onChange={(e) => {
                                      const updated = [...values.details.is_homestay.stays_details.data];
                                      updated[rowIndex] = {
                                        ...updated[rowIndex],
                                        [col]: e.target.value,
                                      };
                                      setFieldValue("details.is_homestay.stays_details.data", updated);
                                    }}
                                    fullWidth
                                  />
                                </Grid>
                              ))}
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(rowIndex)}
                                  variant="outlined"
                                  color="error"
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push({})}
                            sx={{ mt: 1 }}
                          >
                            + Add Row
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Hotel Info" sx={{ mt: 4 }}>
                <Grid container spacing={2}>

                  {/* Active Switch */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.details.is_hotel.active}
                          onChange={(e) =>
                            setFieldValue('details.is_hotel.active', e.target.checked)
                          }
                          name="details.is_hotel.active"
                        />
                      }
                      label="Enable Hotel Section"
                    />
                  </Grid>

                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Hotel Title"
                      name="details.is_hotel.title"
                      value={values.details.is_hotel.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.is_hotel?.title &&
                        Boolean(errors.details?.is_hotel?.title)
                      }
                      helperText={
                        touched.details?.is_hotel?.title &&
                        errors.details?.is_hotel?.title
                      }
                    />
                  </Grid>

                  {/* Description */}
                  <FieldArray name="details.is_hotel.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Descriptions</strong></Grid>
                        {values.details.is_hotel.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.is_hotel.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.is_hotel.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => push('')} sx={{ mt: 1 }}>
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Columns */}
                  <FieldArray name="details.is_hotel.stays_details.columns">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Table Columns</strong></Grid>
                        {values.details.is_hotel.stays_details.columns.map((col, index) => (
                          <Grid item xs={3} key={`col-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Column ${index + 1}`}
                              name={`details.is_hotel.stays_details.columns[${index}]`}
                              value={col}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.is_hotel.stays_details.columns.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button onClick={() => push('')} variant="outlined" sx={{ mt: 1 }}>
                            + Add Column
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Data Rows */}
                  <FieldArray name="details.is_hotel.stays_details.data">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Hotel Rows</strong></Grid>
                        {values.details.is_hotel.stays_details.data.map((row, rowIndex) => (
                          <Grid item xs={12} key={`row-${rowIndex}`}>
                            <Grid container spacing={2}>
                              {values.details.is_hotel.stays_details.columns.map((col, colIndex) => (
                                <Grid item xs={3} key={`cell-${rowIndex}-${colIndex}`}>
                                  <TextField
                                    label={col || `Column ${colIndex + 1}`}
                                    name={`details.is_hotel.stays_details.data[${rowIndex}][${col}]`}
                                    value={row[col] || ''}
                                    onChange={(e) => {
                                      const updated = [...values.details.is_hotel.stays_details.data];
                                      updated[rowIndex] = {
                                        ...updated[rowIndex],
                                        [col]: e.target.value,
                                      };
                                      setFieldValue("details.is_hotel.stays_details.data", updated);
                                    }}
                                    fullWidth
                                  />
                                </Grid>
                              ))}
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(rowIndex)}
                                  variant="outlined"
                                  color="error"
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push({})}
                            sx={{ mt: 1 }}
                          >
                            + Add Row
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Resort Info" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Active Switch */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.details.is_resort.active}
                          onChange={(e) =>
                            setFieldValue('details.is_resort.active', e.target.checked)
                          }
                          name="details.is_resort.active"
                        />
                      }
                      label="Enable Resort Section"
                    />
                  </Grid>

                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Resort Title"
                      name="details.is_resort.title"
                      value={values.details.is_resort.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.is_resort?.title &&
                        Boolean(errors.details?.is_resort?.title)
                      }
                      helperText={
                        touched.details?.is_resort?.title &&
                        errors.details?.is_resort?.title
                      }
                    />
                  </Grid>

                  {/* Description */}
                  <FieldArray name="details.is_resort.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Descriptions</strong></Grid>
                        {values.details.is_resort.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.is_resort.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.is_resort.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Columns */}
                  <FieldArray name="details.is_resort.stays_details.columns">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Table Columns</strong></Grid>
                        {values.details.is_resort.stays_details.columns.map((col, index) => (
                          <Grid item xs={3} key={`col-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Column ${index + 1}`}
                              name={`details.is_resort.stays_details.columns[${index}]`}
                              value={col}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.is_resort.stays_details.columns.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Column
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Data Rows */}
                  <FieldArray name="details.is_resort.stays_details.data">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Resort Rows</strong></Grid>
                        {values.details.is_resort.stays_details.data.map((row, rowIndex) => (
                          <Grid item xs={12} key={`row-${rowIndex}`}>
                            <Grid container spacing={2}>
                              {values.details.is_resort.stays_details.columns.map((col, colIndex) => (
                                <Grid item xs={3} key={`cell-${rowIndex}-${colIndex}`}>
                                  <TextField
                                    label={col || `Column ${colIndex + 1}`}
                                    name={`details.is_resort.stays_details.data[${rowIndex}][${col}]`}
                                    value={row[col] || ''}
                                    onChange={(e) => {
                                      const updated = [...values.details.is_resort.stays_details.data];
                                      updated[rowIndex] = {
                                        ...updated[rowIndex],
                                        [col]: e.target.value,
                                      };
                                      setFieldValue("details.is_resort.stays_details.data", updated);
                                    }}
                                    fullWidth
                                  />
                                </Grid>
                              ))}
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(rowIndex)}
                                  variant="outlined"
                                  color="error"
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push({})}
                            sx={{ mt: 1 }}
                          >
                            + Add Row
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Travel Guidelines / Pro Tips" sx={{ mt: 4 }}>
                <Grid container spacing={2}>

                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.guideLines.title"
                      value={values.details.guideLines.title}
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.guideLines?.title &&
                        Boolean(errors.details?.guideLines?.title)
                      }
                      helperText={
                        touched.details?.guideLines?.title &&
                        errors.details?.guideLines?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.guideLines.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Section Description</strong></Grid>
                        {values.details.guideLines.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              name={`details.guideLines.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.guideLines.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Details Array */}
                  <FieldArray name="details.guideLines.details">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Guideline Tips</strong></Grid>
                        {values.details.guideLines.details.map((tip, index) => (
                          <Grid item xs={12} key={`tip-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Tip ${index + 1}`}
                              name={`details.guideLines.details[${index}]`}
                              value={tip}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              variant="outlined"
                              color="error"
                              disabled={values.details.guideLines.details.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Tip
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                </Grid>
              </SectionWrapper>
              <SectionWrapper title="Stay Cautious About" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      label="Section Title"
                      name="details.stay_cautious_about.title"
                      value={values.details.stay_cautious_about.title}
                      multiline
                      onChange={handleChange}
                      fullWidth
                      error={
                        touched.details?.stay_cautious_about?.title &&
                        Boolean(errors.details?.stay_cautious_about?.title)
                      }
                      helperText={
                        touched.details?.stay_cautious_about?.title &&
                        errors.details?.stay_cautious_about?.title
                      }
                    />
                  </Grid>

                  {/* Description Array */}
                  <FieldArray name="details.stay_cautious_about.description">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Section Description</strong></Grid>
                        {values.details.stay_cautious_about.description.map((desc, index) => (
                          <Grid item xs={12} key={`desc-${index}`} sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label={`Description ${index + 1}`}
                              multiline
                              name={`details.stay_cautious_about.description[${index}]`}
                              value={desc}
                              onChange={handleChange}
                              fullWidth
                            />
                            <Button
                              onClick={() => remove(index)}
                              color="error"
                              variant="outlined"
                              disabled={values.details.stay_cautious_about.description.length === 1}
                            >
                              Remove
                            </Button>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push('')}
                            sx={{ mt: 1 }}
                          >
                            + Add Description
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>

                  {/* Caution Points */}
                  <FieldArray name="details.stay_cautious_about.details">
                    {({ push, remove }) => (
                      <>
                        <Grid item xs={12}><strong>Caution Points</strong></Grid>
                        {values.details.stay_cautious_about.details.map((item, index) => (
                          <Grid item xs={12} key={`item-${index}`}>
                            <Grid container spacing={2}>
                              <Grid item xs={5}>
                                <TextField
                                  label="Title"
                                  name={`details.stay_cautious_about.details[${index}].name`}
                                  value={item.name}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  label="Description"
                                  name={`details.stay_cautious_about.details[${index}].description`}
                                  value={item.description}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                  onClick={() => remove(index)}
                                  variant="outlined"
                                  color="error"
                                  disabled={values.details.stay_cautious_about.details.length === 1}
                                >
                                  X
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => push({ name: '', description: '' })}
                            sx={{ mt: 1 }}
                          >
                            + Add Caution Point
                          </Button>
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Grid>
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
              <SectionWrapper title="Frequently Asked Questions (FAQs)">
                <FieldArray name="details.faqs">
                  {({ push, remove }) => (
                    <Grid container spacing={2}>
                      {values.details.faqs?.map((faq, index) => (
                        <React.Fragment key={index}>
                          <Grid item xs={12} sm={5}>
                            <TextField
                              name={`details.faqs[${index}].question`}
                              label={`Question ${index + 1}`}
                              multiline
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
                        </React.Fragment>
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

export default CtgForm;