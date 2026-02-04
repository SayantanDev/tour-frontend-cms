import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";
import { getImages, imageUpload, imageDelete } from "../../api/imageUploadApi";

const ImageManagerPage = () => {
  const { schema, id } = useParams();

  const [existingImages, setExistingImages] = useState([]);
  const [existingName, setExistingName] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // 🔹 Fetch existing images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await getImages(schema, id);
        setExistingImages(res.images || []);
        setExistingName(res.name || "Document");
      } catch (err) {
        console.error("Failed to load images", err);
      }
    };
    if (id && schema) fetchImages();
  }, [schema, id]);

  // 🔹 Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  // 🔹 Remove a selected (new) image before upload
  const handleRemovePreview = (index) => {
    const updatedFiles = [...newFiles];
    const updatedPreviews = [...previewUrls];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setNewFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  // 🔹 Handle image upload
  const handleUpload = async () => {
    if (!id || newFiles.length === 0) {
      alert("Please select images.");
      return;
    }

    const formData = new FormData();
    newFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await imageUpload(schema, id, formData);
      setExistingImages(res.data.images || []);
      setNewFiles([]);
      setPreviewUrls([]);
      alert("Upload successful!");
    } catch (err) {
      console.error("Upload error", err);
      alert("Upload failed.");
    }
  };

  // 🔹 Handle delete from Azure + MongoDB
  const handleDelete = async (imageUrl) => {
    setTimeout(async () => {
      const confirm = window.confirm("Are you sure you want to delete this image?");
      if (!confirm) return;

      try {
        const payload = { data: { imageUrl } };
        const res = await imageDelete(schema, id, payload);
        setExistingImages(res.data.images || []);
        alert("Image deleted.");
      } catch (err) {
        console.error("Delete error", err);
        alert("Failed to delete image.");
      }
    }, 0);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Upload Images for {existingName.toUpperCase()}
      </Typography>
      <Typography variant="body2" gutterBottom color="green">
        (Note: The first image will be used as the hero image and should be sized at 1920x1080. The others will be used in the gallery and should be sized at 1080x720.)
      </Typography>

      {/* 🔹 File upload buttons */}
      <Box sx={{ my: 2 }}>
        <Button variant="contained" component="label">
          Select Images
          <input hidden type="file" multiple onChange={handleFileChange} />
        </Button>
        <Button
          variant="contained"
          sx={{ ml: 2 }}
          color="primary"
          onClick={handleUpload}
        >
          Upload
        </Button>
      </Box>

      {/* 🔹 Preview new images */}
      {previewUrls.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            New Image Preview
          </Typography>
          <Grid container spacing={2}>
            {previewUrls.map((url, idx) => (
              <Grid item key={idx} xs={6} sm={4} md={3}>
                <Card sx={{ position: "relative" }}>
                  <CardMedia component="img" height="140" image={url} />
                  <Tooltip title="Remove from selection">
                    <IconButton
                      size="small"
                      color="error"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 2,
                        backgroundColor: "white",
                      }}
                      onClick={() => handleRemovePreview(idx)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* 🔹 Existing images */}
      {existingImages.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 4 }}>
            Previously Uploaded Images
          </Typography>
          <Grid container spacing={2}>
            {existingImages.map((url, idx) => (
              <Grid item key={idx} xs={6} sm={4} md={3}>
                <Card sx={{ position: "relative" }}>
                  <CardMedia component="img" height="140" image={url} />
                  <CardContent>
                    <Typography variant="caption" noWrap>
                      {url.split("/").pop()}
                    </Typography>
                  </CardContent>
                  <Tooltip title="Delete from server">
                    <IconButton
                      size="small"
                      color="error"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 2,
                        backgroundColor: "white",
                      }}
                      onClick={() => handleDelete(url)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ImageManagerPage;
