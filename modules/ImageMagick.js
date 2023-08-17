const gm = require('gm').subClass({ imageMagick: true });

class ImageMagick {
    async cropBottom(inputBuffer) {
        return new Promise((resolve, reject) => {
            gm(inputBuffer)
                .gravity('South')
                .background('transparent')
                .trim()
                .toBuffer((err, croppedBuffer) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(croppedBuffer);
                    }
                })
        });
    }
}

module.exports = new ImageMagick();