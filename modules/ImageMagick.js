const gm = require('gm').subClass({ imageMagick: true });

class ImageMagick {
    async cropBottom(inputBuffer) {
        return new Promise((resolve, reject) => {
            gm(inputBuffer)
                .gravity('South')
                .trim()
                .extent(2000, 2000)
                .background('white')
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