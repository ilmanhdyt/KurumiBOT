const { runtime } = require('../lib/functions');

module.exports = {
    command: ['runtime', 'uptime'],
    category: 'main',
    description: 'Cek lama bot aktif',

    async execute({ m }) {
        const uptime = runtime(process.uptime());
        await m.reply(`Bot telah aktif selama:\n${uptime}`);
    }
};
