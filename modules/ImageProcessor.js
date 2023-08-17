const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class ImageProcessor {
    extractSkuFromImageUrl(imageUrl) {
        const match = imageUrl.match(/\/s(\d+)-/);
        console.log(match);
        return match ? match[1] : null;
    }

    getNewImageFileName(imageUrl) {
        // this is to create image with the sku name and replace if already exists
        // otherwise create with a unique id
        const skuId = this.extractSkuFromImageUrl(imageUrl);
        const imageId = skuId || uuidv4();
        const imageFileName = `${imageId}.png`;
        return imageFileName
    }

    getNewImageFilePath(imageFileName, processedImagesDir) {
        const imagePath = path.join(processedImagesDir, imageFileName);
        return imagePath;
    }

    saveImageFile(imagePath, imageBuffer) {
        fs.writeFileSync(imagePath, imageBuffer);
    }

    checkIfSkuImageExists(imageUrl, processedImagesDir) {
        const skuId = this.extractSkuFromImageUrl(imageUrl);
        const imageFileName = `${skuId}.png`;
        const imagePath = path.join(processedImagesDir, imageFileName);
        // Check if the processed image already exists
        if (fs.existsSync(imagePath)) {
            return imageFileName; // Return the existing image URL
        }
        return false;
    }
    
    async fetchImageUrl(imageUrl) {
        // Download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);
        return imageBuffer;
    }

    async saveProcessedImage(imageUrl, imageBuffer, processedImagesDir) {
        const imageFileName = this.getNewImageFileName(imageUrl);
        const imagePath = this.getNewImageFilePath(imageFileName, processedImagesDir);
        
        // Save the processed image locally
        await imageBuffer.webp().toFile(imagePath);

        return imageFileName;
    }
    
}

module.exports = new ImageProcessor();