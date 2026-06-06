const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

module.exports = {
    command: ['backupdb', 'backup'],
    category: 'owner',
    description: 'Backup database',
    owner: true,

    async execute({ sock, m, config }) {
        await m.reply('⏳ Sedang membuat backup database...');

        const dbPath = path.join(__dirname, '../../database');
        const backupPath = path.join(__dirname, '../../database_backup.zip');

        const output = fs.createWriteStream(backupPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // tingkat kompresi maksimum
        });

        output.on('close', async () => {
            await sock.sendMessage(m.from, {
                document: fs.readFileSync(backupPath),
                mimetype: 'application/zip',
                fileName: `database_backup_${Date.now()}.zip`,
                caption: '✅ Ini adalah backup database terbaru.'
            }, { quoted: m });

            // Hapus file zip setelah dikirim
            fs.unlinkSync(backupPath);
        });

        archive.on('error', (err) => {
            console.error(err);
            m.reply('❌ Gagal membuat backup database.');
        });

        archive.pipe(output);
        archive.directory(dbPath, false);
        archive.finalize();
    }
};
