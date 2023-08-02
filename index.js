const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Rembg } = require("rembg-node");
const fs = require('fs');
const path = require('path');
const sharp = require("sharp");
const axios = require('axios');

const app = express();
const PORT = 3005;
const processedImagesDir = path.join(__dirname, 'processed_images');

// Create the 'processed_images' folder if it doesn't exist
if (!fs.existsSync(processedImagesDir)) {
    fs.mkdirSync(processedImagesDir);
}

app.use(cors()); // Use the cors middleware to enable CORS
app.use(express.json()); // Use built-in express.json() middleware to parse JSON data

const extractSkuFromImageUrl = (imageUrl) => {
    const match = imageUrl.match(/\/s(\d+)-/);
    return match ? match[1] : null;
}

app.post('/process', async (req, res) => {
    const { imageUrl } = req.body;
    console.log(imageUrl);

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL not provided' });
    }

    try {
        // Download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);

        // Process the image
        const input = sharp(imageBuffer);
        const rembg = new Rembg({
            logging: true,
        });
        const output = await rembg.remove(input);

        // this is to create image with the sku name and replace if already exists
        // otherwise create with a unique id
        const skuId = extractSkuFromImageUrl(imageUrl);
        const imageId = skuId || uuidv4();
        const imageFileName = `${imageId}.png`;
        const imagePath = path.join(processedImagesDir, imageFileName);

        //fs.writeFileSync(imagePath, output);
        
        // Save the processed image locally
        await output.webp().toFile(imagePath);

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