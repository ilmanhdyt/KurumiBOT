const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');

function imageToWebp(mediaPath) {
    return new Promise((resolve, reject) => {
        const outPath = mediaPath + '.webp';
        ffmpeg(mediaPath)
            .inputOptions(['-y'])
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000'
            ])
            .toFormat('webp')
            .save(outPath)
            .on('end', () => {
                const buffer = fs.readFileSync(outPath);
                fs.unlinkSync(outPath); // cleanup
                resolve(buffer);
            })
            .on('error', (err) => reject(err));
    });
}

function videoToWebp(mediaPath) {
    return new Promise((resolve, reject) => {
        const outPath = mediaPath + '.webp';
        ffmpeg(mediaPath)
            .inputOptions(['-y'])
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
                '-loop', '0',
                '-ss', '00:00:00',
                '-t', '00:00:05', // limit 5 detik
                '-preset', 'default',
                '-an',
                '-vsync', '0'
            ])
            .toFormat('webp')
            .save(outPath)
            .on('end', () => {
                const buffer = fs.readFileSync(outPath);
                fs.unlinkSync(outPath); // cleanup
                resolve(buffer);
            })
            .on('error', (err) => reject(err));
    });
}

function webpToImage(mediaPath) {
    return new Promise((resolve, reject) => {
        const outPath = mediaPath + '.jpg';
        ffmpeg(mediaPath)
            .inputOptions(['-y'])
            .outputOptions([
                '-vframes', '1'
            ])
            .toFormat('image2')
            .save(outPath)
            .on('end', () => {
                const buffer = fs.readFileSync(outPath);
                fs.unlinkSync(outPath); // cleanup
                resolve(buffer);
            })
            .on('error', (err) => reject(err));
    });
}

const webp = require('node-webpmux');

async function addExif(webpBuffer, packname, author) {
    const img = new webp.Image();
    await img.load(webpBuffer);

    const json = {
        "sticker-pack-id": "com.snowcorp.stickerly.android.stickercontentprovider b5e7275f-f1de-4137-961f-57becfad34f2",
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        "emojis": ["🤍"]
    };

    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);

    img.exif = exif;
    return await img.save(null);
}

module.exports = { imageToWebp, videoToWebp, webpToImage, addExif };
