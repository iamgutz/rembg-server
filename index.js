const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ImageProcessor = require('./modules/ImageProcessor');
const SmartCropper = require('./modules/SmartCropper');

const app = express();
const PORT = 3005;
const processedImagesDir = path.join(__dirname, 'processed_images');

// Create the 'processed_images' folder if it doesn't exist
if (!fs.existsSync(processedImagesDir)) {
    fs.mkdirSync(processedImagesDir);
}

app.use(cors()); // Use the cors middleware to enable CORS
app.use(express.json()); // Use built-in express.json() middleware to parse JSON data

app.post('/process', async (req, res) => {
    const { imageUrl } = req.body;
    console.log(imageUrl);

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL not provided' });
    }

    try {
        const imageBuffer = await ImageProcessor.fetchImageUrl(imageUrl);
        const predictions = await SmartCropper.detectObject(imageBuffer);
        const croppedImageBuffer = await SmartCropper.cropImage(imageBuffer, predictions);
        const outputImage = await ImageProcessor.removeBackground(croppedImageBuffer);
        const imageFileName = await ImageProcessor.saveProcessedImage(imageUrl, outputImage, processedImagesDir);
        const imageServeUrl = `http://localhost:${PORT}/images/${imageFileName}`;
        res.json({ imageUrl: imageServeUrl });
    } catch (error) {
        console.error('Error processing image: ', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

app.use('/images', express.static(processedImagesDir));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});