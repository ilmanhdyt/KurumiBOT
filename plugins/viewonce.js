const { downloadContentFromMessage } = require('baileys-pro');

module.exports = {
    command: ['rvo'],
    category: 'utility',
    description: 'Melihat pesan sekali lihat (view once)',

    async execute({ sock, m }) {
        try {
            // Ambil pesan yang di-reply (quoted message)
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) return m.reply('⚠️ Silakan reply pesan view once (sekali lihat) dengan perintah ini.');

            // Cek apakah pesan yang di-reply adalah view once
            let isViewOnce = false;
            let mediaObj = null;
            let mediaType = '';

            const viewOnceKey = Object.keys(quoted).find(k => k.toLowerCase().includes('viewonce'));
            if (viewOnceKey) {
                isViewOnce = true;
                const viewOnceMessage = quoted[viewOnceKey].message;
                mediaType = Object.keys(viewOnceMessage)[0]; 
                mediaObj = viewOnceMessage[mediaType];
            } else {
                // Cek kemungkinan format message biasa dengan flag viewOnce: true
                const type = Object.keys(quoted)[0];
                if (quoted[type] && quoted[type].viewOnce) {
                    isViewOnce = true;
                    mediaType = type;
                    mediaObj = quoted[type];
                }
            }

            if (!isViewOnce) {
                return m.reply(`⚠️ Pesan yang Anda reply bukan pesan view once.\n\n*(Debug: Tipe pesan terdeteksi: ${Object.keys(quoted).join(', ')})*`);
            }

            if (!mediaObj) return m.reply('⚠️ Tidak dapat membaca isi pesan view once.');

            await m.reply('⏳ Sedang memproses media...');

            // Download media menggunakan fungsi dari Baileys
            const stream = await downloadContentFromMessage(mediaObj, mediaType.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const caption = `*VIEW ONCE TERBACA*\n\n${mediaObj.caption ? `Caption: ${mediaObj.caption}` : ''}`;

            // Kirim ulang media
            if (mediaType === 'imageMessage') {
                await sock.sendMessage(m.from, { image: buffer, caption: caption }, { quoted: m });
            } else if (mediaType === 'videoMessage') {
                await sock.sendMessage(m.from, { video: buffer, caption: caption }, { quoted: m });
            } else if (mediaType === 'audioMessage') {
                await sock.sendMessage(m.from, { audio: buffer, ptt: mediaObj.ptt }, { quoted: m });
            } else {
                await m.reply(`⚠️ Tipe media ${mediaType} tidak didukung untuk saat ini.`);
            }

        } catch (e) {
            console.error('Error in viewonce plugin:', e);
            await m.reply('❌ Terjadi kesalahan saat membaca pesan view once.');
        }
    }
};
