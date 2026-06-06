const { downloadContentFromMessage } = require('baileys-pro');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Gunakan object global agar data tidak hilang jika plugin di-reload
if (!global.pdfSessions) {
    global.pdfSessions = {};
}

module.exports = {
    command: ['topdf', 'finishpdf'],
    category: 'utility',
    description: 'Mengubah satu atau banyak gambar menjadi PDF',

    async execute({ sock, m, command }) {
        const sender = m.sender;

        // Pastikan folder temp ada
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        // === COMMAND: .finishpdf ===
        if (command === 'finishpdf') {
            const userSession = global.pdfSessions[sender];
            if (!userSession || userSession.length === 0) {
                return m.reply('⚠️ Anda belum menambahkan gambar apapun. Kirim gambar dengan caption .topdf terlebih dahulu.');
            }

            await m.reply('⏳ Sedang memproses PDF Anda...');
            
            const pdfPath = path.join(tempDir, `Result_${sender.split('@')[0]}.pdf`);
            const doc = new PDFDocument({ autoFirstPage: false });
            const stream = fs.createWriteStream(pdfPath);
            doc.pipe(stream);

            // Tambahkan gambar satu per satu ke dalam PDF
            for (const imgPath of userSession) {
                try {
                    // Membuat halaman dengan ukuran yang sesuai gambar (atau ukuran default)
                    const img = doc.openImage(imgPath);
                    doc.addPage({ size: [img.width, img.height] });
                    doc.image(imgPath, 0, 0);
                } catch (e) {
                    console.error('Error adding image to PDF:', e);
                }
            }
            doc.end();

            stream.on('finish', async () => {
                // Kirim PDF ke user
                await sock.sendMessage(m.from, { 
                    document: fs.readFileSync(pdfPath), 
                    mimetype: 'application/pdf', 
                    fileName: `Converted_${Date.now()}.pdf`,
                    caption: `✅ Berhasil mengubah ${userSession.length} gambar menjadi PDF.`
                }, { quoted: m });

                // Bersihkan file temp
                userSession.forEach(file => fs.existsSync(file) && fs.unlinkSync(file));
                if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
                
                // Hapus sesi
                delete global.pdfSessions[sender];
            });

            return;
        }

        // === COMMAND: .topdf ===
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        let mediaMessage = null;
        if (m.type === 'imageMessage') {
            mediaMessage = m.message.imageMessage;
        } else if (quoted && quoted.imageMessage) {
            mediaMessage = quoted.imageMessage;
        }

        if (!mediaMessage) {
            return m.reply('⚠️ Silakan kirim gambar dengan caption .topdf atau reply gambar yang sudah ada dengan .topdf');
        }

        await m.reply('⏳ Sedang mengunduh gambar...');

        // Download gambar
        const dlStream = await downloadContentFromMessage(mediaMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of dlStream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Simpan gambar ke temp folder
        const imgPath = path.join(tempDir, `img_${Date.now()}_${sender.split('@')[0]}.jpg`);
        fs.writeFileSync(imgPath, buffer);

        // Tambahkan ke sesi
        if (!global.pdfSessions[sender]) {
            global.pdfSessions[sender] = [];
        }
        global.pdfSessions[sender].push(imgPath);

        const totalImages = global.pdfSessions[sender].length;
        
        await m.reply(`✅ Gambar berhasil ditambahkan! (Total: ${totalImages} gambar)\n\nKirim/reply gambar lain dengan *.topdf* jika ingin menambah gambar lagi, atau ketik *.finishpdf* jika sudah selesai untuk merender PDF-nya.`);
    }
};
