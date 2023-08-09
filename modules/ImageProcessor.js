const { v4: uuidv4 } = require('uuid');
const { Rembg } = require("rembg-node");
const fs = require('fs');
const path = require('path');
const sharp = require("sharp");
const axios = require('axios');

class ImageProcessor {
    extractSkuFromImageUrl(imageUrl) {
        const match = imageUrl.match(/\/s(\d+)-/);
        return match ? match[1] : null;
    }
    
    async fetchImageUrl(imageUrl) {
        // Download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);
        return imageBuffer;
    }

    async removeBackground(imageBuffer) {
        // Process the image
        const input = sharp(imageBuffer);
        const rembg = new Rembg({
            logging: true,
        });
        const output = await rembg.remove(input);

        return output;
    }

    async saveProcessedImage(imageUrl, outputImage, processedImagesDir) {
        // this is to create image with the sku name and replace if already exists
        // otherwise create with a unique id
        const skuId = this.extractSkuFromImageUrl(imageUrl);
        const imageId = skuId || uuidv4();
        const imageFileName = `${imageId}.png`;
        const imagePath = path.join(processedImagesDir, imageFileName);
        //fs.writeFileSync(imagePath, output);
        
        // Save the processed image locally
        await outputImage.webp().toFile(imagePath);

        return imageFileName;
    }
    
}

module.exports = new ImageProcessor();