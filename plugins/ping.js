module.exports = {
    command: ['ping'],
    category: 'main',
    description: 'Cek respon bot',

    async execute({ m }) {
        const start = Date.now();
        await m.reply('Pinging...');
        const end = Date.now();
        await m.reply(`Pong! Response time: ${end - start}ms`);
    }
};
