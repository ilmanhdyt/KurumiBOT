const { downloadContentFromMessage } = require('baileys-pro');
const fs = require('fs');
const path = require('path');
const { imageToWebp, videoToWebp, addExif } = require('../lib/converter');

module.exports = {
    command: ['sticker', 's'],
    category: 'utility',
    description: 'Mengubah gambar atau video menjadi stiker',

    async execute({ sock, m, config }) {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        let mediaMessage = null;
        let type = '';

        if (m.type === 'imageMessage' || m.type === 'videoMessage') {
            type = m.type;
            mediaMessage = m.message[type];
        } else if (quoted && (quoted.imageMessage || quoted.videoMessage)) {
            type = quoted.imageMessage ? 'imageMessage' : 'videoMessage';
            mediaMessage = quoted[type];
        }

        if (!mediaMessage) {
            return m.reply('⚠️ Silakan kirim gambar/video dengan caption *.s* atau reply gambar/video dengan perintah *.s*');
        }

        // Jika video, cek durasi
        if (type === 'videoMessage' && mediaMessage.seconds > 10) {
            return m.reply('⚠️ Maksimal durasi video untuk stiker adalah 10 detik!');
        }

        await m.reply('⏳ Sedang membuat stiker...');

        try {
            // Download media
            const dlStream = await downloadContentFromMessage(mediaMessage, type.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of dlStream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const ext = type === 'imageMessage' ? '.jpg' : '.mp4';
            const tempPath = path.join(tempDir, `media_${Date.now()}${ext}`);
            fs.writeFileSync(tempPath, buffer);

            let stickerBuffer;
            if (type === 'imageMessage') {
                stickerBuffer = await imageToWebp(tempPath);
            } else {
                stickerBuffer = await videoToWebp(tempPath);
            }

            // Tambahkan EXIF watermark
            const finalSticker = await addExif(stickerBuffer, config.ownerName, config.botName);

            // Hapus file temp aslinya
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

            await sock.sendMessage(m.from, { sticker: finalSticker }, { quoted: m });

        } catch (error) {
            console.error('Sticker Error:', error);
            await m.reply('❌ Terjadi kesalahan saat membuat stiker. Pastikan format file valid.');
        }
    }
};
