const config = require('./config');
const db = require('./lib/database');
const loader = require('./lib/loader');
const { serialize } = require('./lib/serialize');
const chalk = require('chalk');

module.exports = async (sock, m) => {
    try {
        if (!m || m.type === 'protocolMessage') return;
        
        m = serialize(sock, m);
        if (!m.text) return;

        const isOwner = config.owner.includes(m.sender.split('@')[0]);
        const isGroup = m.isGroup;
        
        // Auto create user & group
        db.getUser(m.sender);
        if (isGroup) db.getGroup(m.from);

        // Parse Prefix and Command
        const prefix = config.prefix;
        const isCmd = m.text.startsWith(prefix);
        const command = isCmd ? m.text.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = m.text.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        if (!isCmd) return;

        // Mode bot check
        if (config.modeBot === 'self' && !isOwner && !m.isSelf) return;

        // Find plugin
        const plugins = loader.getPlugins();
        let plugin = plugins.find(p => p.command.includes(command));

        if (plugin) {
            // Check requirements
            if (plugin.owner && !isOwner) {
                return m.reply('Maaf, command ini hanya untuk owner bot.');
            }
            if (plugin.group && !isGroup) {
                return m.reply('Maaf, command ini hanya dapat digunakan di dalam grup.');
            }
            if (plugin.private && isGroup) {
                return m.reply('Maaf, command ini hanya dapat digunakan di private chat.');
            }

            console.log(chalk.green(`[COMMAND] ${command} from ${m.sender}`));

            // Execute plugin
            await plugin.execute({
                sock,
                m,
                args,
                text,
                isOwner,
                isGroup,
                command,
                prefix,
                db,
                config,
                plugins
            });
        }
    } catch (e) {
        console.error(chalk.red('[HANDLER ERROR]'), e);
        m.reply('Terjadi kesalahan pada server bot.');
    }
};
