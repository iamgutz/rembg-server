const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const sharp = require('sharp');

class SmartCropper {
    async detectObject(imageBuffer) {
        const model = await cocoSsd.load();
        const decodedImage = tf.node.decodeImage(imageBuffer);
        const predictions = await model.detect(decodedImage);
        return predictions;
    }

    async cropImage(imageBuffer, predictions) {
        if (predictions.length === 0) {
            throw new Error('No objects detected.');
        }
        const object = predictions[0]; // Assuming the first detected object is the desired one
        const image = sharp(imageBuffer);
        const { width, height } = object.bbox;

        // Crop the image based on object bounding box
        const croppedImageBuffer = await image.extract({
            left: object.bbox[0],
            top: object.bbox[1],
            width,
            height,
        }).toBugger();

        return croppedImageBuffer;
    }
}

module.exports = new SmartCropper();