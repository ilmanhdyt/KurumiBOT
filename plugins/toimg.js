const { downloadContentFromMessage } = require('baileys-pro');
const fs = require('fs');
const path = require('path');
const { webpToImage } = require('../lib/converter');

module.exports = {
    command: ['toimg', 'toimage'],
    category: 'utility',
    description: 'Mengubah stiker menjadi gambar',

    async execute({ sock, m }) {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted || !quoted.stickerMessage) {
            return m.reply('⚠️ Silakan reply stiker yang ingin dijadikan gambar dengan perintah *.toimg*');
        }

        if (quoted.stickerMessage.isAnimated) {
            return m.reply('⚠️ Maaf, saat ini fitur ini hanya mendukung stiker statis (bukan stiker bergerak).');
        }

        await m.reply('⏳ Sedang mengubah stiker menjadi gambar...');

        try {
            const dlStream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of dlStream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
            fs.writeFileSync(tempPath, buffer);

            const imgBuffer = await webpToImage(tempPath);

            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

            await sock.sendMessage(m.from, { 
                image: imgBuffer,
                caption: '✅ Berhasil mengubah stiker menjadi gambar!'
            }, { quoted: m });

        } catch (error) {
            console.error('ToImg Error:', error);
            await m.reply('❌ Terjadi kesalahan saat memproses stiker.');
        }
    }
};
