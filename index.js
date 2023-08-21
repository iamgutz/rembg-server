const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ImageProcessor = require('./modules/ImageProcessor');
const TensorFlow = require('./modules/TensorFlow');
const RemBg = require('./modules/RemBg');
const ImageMagick = require('./modules/ImageMagick');

const app = express();
const PORT = 3005;
const processedImagesDir = path.join(__dirname, 'processed_images');

const getServerImageUrl = (imageFileName) => `http://localhost:${PORT}/images/${imageFileName}`;

// Create the 'processed_images' folder if it doesn't exist
if (!fs.existsSync(processedImagesDir)) {
    fs.mkdirSync(processedImagesDir);
}

app.use(cors()); // Use the cors middleware to enable CORS
app.use(express.json()); // Use built-in express.json() middleware to parse JSON data

app.post('/rembg', async (req, res) => {
    const { imageUrl } = req.body;
    console.log(imageUrl);

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL not provided' });
    }

    const existingSkuImage = ImageProcessor.checkIfSkuImageExists(imageUrl, processedImagesDir);
    if (existingSkuImage) {
        return res.json({ imageUrl: getServerImageUrl(existingSkuImage) });
    }

    try {
        const imageBuffer = await ImageProcessor.fetchImageUrl(imageUrl);
        const imageWithOutBg = await RemBg.removeBackground(imageBuffer);
        const imageFileName = await ImageProcessor.saveProcessedImage(imageUrl, imageWithOutBg, processedImagesDir);
        const imageServeUrl = getServerImageUrl(imageFileName);
        res.json({ imageUrl: imageServeUrl });
    } catch (error) {
        console.error('Error processing image: ', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

app.post('/tensorflow', async (req, res) => {
    const { imageUrl } = req.body;
    console.log(imageUrl);

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL not provided' });
    }

    try {
        const imageBuffer = await ImageProcessor.fetchImageUrl(imageUrl);
        const predictions = await TensorFlow.detectObject(imageBuffer);
        const imageRembgBuffer = await RemBg.removeBackground(imageBuffer, true);
        const croppedImageBuffer = await TensorFlow.cropImage(imageRembgBuffer, predictions, false);
        const imageFileName = await ImageProcessor.saveProcessedImage(imageUrl, croppedImageBuffer, processedImagesDir);
        const imageServeUrl = getServerImageUrl(imageFileName);
        res.json({ imageUrl: imageServeUrl });
    } catch (error) {
        console.error('Error processing image: ', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

app.post('/magick', async (req, res) => {
    const { imageUrl } = req.body;
    console.log(imageUrl);

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL not provided' });
    }

    try {
        const imageBuffer = await ImageProcessor.fetchImageUrl(imageUrl);
        const croppedBuffer = await ImageMagick.cropBottom(imageBuffer);
        const imageFileName = ImageProcessor.getNewImageFileName(imageUrl);
        const imageFilePath = ImageProcessor.getNewImageFilePath(imageFileName, processedImagesDir);
        // Save the cropped image to the specified path
        fs.writeFileSync(imageFilePath, croppedBuffer);
        const imageServeUrl = getServerImageUrl(imageFileName);
        res.json({ imageUrl: imageServeUrl });
    } catch (error) {
        console.error('Error processing image: ', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

// This endpoint combines the smart cropping and the remove of background processes
app.post('/process-image', async (req, res) => {
    const { imageUrl } = req.body;
    console.log(imageUrl);

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL not provided' });
    }

    const existingSkuImage = ImageProcessor.checkIfSkuImageExists(imageUrl, processedImagesDir);
    if (existingSkuImage) {
        return res.json({ imageUrl: getServerImageUrl(existingSkuImage) });
    }

    try {
        const imageBuffer = await ImageProcessor.fetchImageUrl(imageUrl);
        const croppedBuffer = await ImageMagick.cropBottom(imageBuffer);
        const rembgBuffer = await RemBg.removeBackground(croppedBuffer);

        // Save the cropped image to the specified path
        const imageFileName = await ImageProcessor.saveProcessedImage(imageUrl, rembgBuffer, processedImagesDir);
        const imageServeUrl = getServerImageUrl(imageFileName);
        res.json({ imageUrl: imageServeUrl });
    } catch (error) {
        console.error('Error processing image: ', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

// This endpoint combines the smart cropping and the remove of background processes
app.post('/process', async (req, res) => {
    const { imageUrl } = req.body;
    console.log(imageUrl);

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL not provided' });
    }

    /*
    const existingSkuImage = ImageProcessor.checkIfSkuImageExists(imageUrl, processedImagesDir);
    if (existingSkuImage) {
        return res.json({ imageUrl: getServerImageUrl(existingSkuImage) });
    }
    */

    try {
        const imageBuffer = await ImageProcessor.fetchImageUrl(imageUrl);
        const rembgBuffer = await RemBg.removeBackground(imageBuffer, true);
        const croppedBuffer = await ImageMagick.cropBottom(rembgBuffer, 'transparent');

        const imageFileName = ImageProcessor.getNewImageFileName(imageUrl);
        const imageFilePath = ImageProcessor.getNewImageFilePath(imageFileName, processedImagesDir);

        // Save the cropped image to the specified path
        fs.writeFileSync(imageFilePath, croppedBuffer);
        const imageServeUrl = getServerImageUrl(imageFileName);
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