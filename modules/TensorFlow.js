const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const sharp = require('sharp');

class TensorFlow {
    async detectObject(imageBuffer) {
        const model = await cocoSsd.load();
        const decodedImage = tf.node.decodeImage(imageBuffer);
        const predictions = await model.detect(decodedImage);
        console.log(predictions);
        return predictions;
    }

    async cropImage(imageBuffer, predictions, returnBuffer = true) {
        if (predictions.length === 0) {
            throw new Error('No objects detected.');
        }
        const object = predictions[0]; // Assuming the first detected object is the desired one
        const image = sharp(imageBuffer);
        const [x, y, width, height] = object.bbox;

        // Crop the image based on object bounding box
        const croppedImageBuffer = await image.extract({
            left: Math.round(x),
            top: Math.round(y),
            width: Math.round(width),
            height: Math.round(height),
        });

        if (returnBuffer) {
            return croppedImageBuffer.toBuffer();
        }

        return croppedImageBuffer;
    }
}

module.exports = new TensorFlow();

// 1- explore image magic
// 2- Rembg to find where the pixel starts

