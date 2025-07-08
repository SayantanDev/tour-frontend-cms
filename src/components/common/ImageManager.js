import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import axios from "axios";

const ImageManager = ({ schema = "category", documentId, folder = "category-images" }) => {
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // 🔹 Fetch existing images from backend
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await axios.get(`/api/${schema}/${documentId}`);
        setExistingImages(res.data.images || []);
      } catch (err) {
        console.error("Failed to fetch document:", err);
      }
    };
    if (documentId) fetchDocument();
  }, [schema, documentId]);

  // 🔹 Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  // 🔹 Upload files to backend
  const handleUpload = async () => {
    if (!documentId || newFiles.length === 0) {
      alert("Select files and provide document ID.");
      return;
    }

    const formData = new FormData();
    newFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await axios.post(
        `/api/upload/${schema}/${documentId}/${folder}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setExistingImages(res.data.data.images || []);
      setNewFiles([]);
      setPreviewUrls([]);
      alert("Upload successful!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Image Manager
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <TextField
            label="Schema"
            value={schema}
            fullWidth
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Document ID"
            value={documentId}
            fullWidth
            disabled
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" component="label">
            Select Images
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleUpload}>
            Upload Selected Images
          </Button>
        </Grid>
      </Grid>

      {/* 🔸 Preview New Images */}
      {previewUrls.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            New Image Preview
          </Typography>
          <Grid container spacing={2}>
            {previewUrls.map((url, index) => (
              <Grid item key={index} xs={6} sm={4} md={3}>
                <Card>
                  <CardMedia component="img" height="140" image={url} alt={`Preview ${index}`} />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 🔸 Existing Images */}
      {existingImages.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Previously Uploaded Images
          </Typography>
          <Grid container spacing={2}>
            {existingImages.map((url, index) => (
              <Grid item key={index} xs={6} sm={4} md={3}>
                <Card>
                  <CardMedia component="img" height="140" image={url} alt={`Existing ${index}`} />
                  <CardContent>
                    <Typography variant="caption" noWrap>
                      {url.split("/").pop()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ImageManager;
