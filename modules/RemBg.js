const sharp = require('sharp');
const { Rembg } = require("rembg-node");

class RemBg {
    async removeBackground(imageBuffer, returnBuffer = false) {
        // Process the image
        const input = sharp(imageBuffer);
        const rembg = new Rembg({
            logging: true,
        });
        const output = await rembg.remove(input);

        if (returnBuffer) {
            return output.png().toBuffer();
        }

        return output;
    }
}

module.exports = new RemBg();