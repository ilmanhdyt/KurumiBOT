module.exports = {
    command: ['owner', 'creator'],
    category: 'main',
    description: 'Menampilkan kontak owner bot',

    async execute({ sock, m, config }) {
        let contacts = [];

        try {
            // Import awesome-phonenumber
            const ap = require('awesome-phonenumber');
            // Support both older default export and newer named export
            const parsePhoneNumber = ap.parsePhoneNumber || ap; 

            for (let num of config.owner) {
                // Pastikan format diawali dengan +, jika nomor di config tidak ada +
                const phoneStr = num.startsWith('+') ? num : '+' + num;
                const parsed = parsePhoneNumber(phoneStr);
                
                // Gunakan nomor asli (tanpa +) untuk waid, dan format internasional untuk display
                const waid = num.replace(/[^0-9]/g, '');
                const formattedName = (parsed && parsed.valid) ? parsed.number.international : phoneStr;

                const vcard = 'BEGIN:VCARD\n'
                    + 'VERSION:3.0\n'
                    + `FN:${config.ownerName}\n`
                    + `ORG:${config.botName};\n`
                    + `TEL;type=CELL;type=VOICE;waid=${waid}:${formattedName}\n`
                    + 'END:VCARD';

                contacts.push({ vcard });
            }

            // Mengirim sebagai contact message (vCard)
            await sock.sendMessage(m.from, {
                contacts: {
                    displayName: config.ownerName,
                    contacts: contacts
                }
            }, { quoted: m });

        } catch (e) {
            console.error('Error in owner contact plugin:', e);
            await m.reply('❌ Terjadi kesalahan saat memproses kontak owner.');
        }
    }
};
