const { runtime } = require('../lib/functions');

module.exports = {
    command: ['menu', 'help'],
    category: 'main',
    description: 'Menampilkan daftar perintah bot',

    async execute({ sock, m, db, config, prefix, plugins }) {
        
        let totalFeatures = 0;
        const categories = {};

        // Mengelompokkan plugin berdasarkan kategori
        plugins.forEach(plugin => {
            if (!plugin.category) return;
            if (!categories[plugin.category]) {
                categories[plugin.category] = [];
            }
            totalFeatures++;
            categories[plugin.category].push(...plugin.command);
        });

        const usersCount = Object.keys(db.users).length;
        const uptime = runtime(process.uptime());

        let menuText = `╭─〔 BOT INFORMATION 〕\n`;
        menuText += `│ Name : ${config.botName}\n`;
        menuText += `│ Runtime : ${uptime}\n`;
        menuText += `│ Users : ${usersCount}\n`;
        menuText += `│ Mode : ${config.modeBot}\n`;
        menuText += `│ Total Features : ${totalFeatures}\n`;
        menuText += `╰──────────────\n\n`;

        // Ubah urutan kategori di bawah ini sesuai yang Anda inginkan
        const categoryOrder = ['main', 'utility', 'owner'];

        // Dapatkan semua nama kategori yang ada
        let categoryKeys = Object.keys(categories);
        
        // Urutkan kategori berdasarkan urutan categoryOrder
        categoryKeys.sort((a, b) => {
            let indexA = categoryOrder.indexOf(a);
            let indexB = categoryOrder.indexOf(b);
            // Jika kategori tidak ada di categoryOrder, taruh di paling bawah
            if (indexA === -1) indexA = 999;
            if (indexB === -1) indexB = 999;
            return indexA - indexB;
        });

        // Merender teks menu berdasarkan urutan
        for (const category of categoryKeys) {
            menuText += `╭─〔 ${category.toUpperCase()} MENU 〕\n`;
            categories[category].forEach(cmd => {
                menuText += `│ ${prefix}${cmd}\n`;
            });
            menuText += `╰──────────────\n\n`;
        }

        menuText;

        const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('baileys-pro');

        try {
            let mediaMsg = null;
            try {
                mediaMsg = await prepareWAMessageMedia({ image: { url: config.thumbnail } }, { upload: sock.waUploadToServer });
            } catch (err) {
                console.log("No thumbnail found or error uploading.");
            }

            const headerObj = {
                title: "",
                subtitle: "",
                hasMediaAttachment: !!mediaMsg
            };

            if (mediaMsg) {
                headerObj.imageMessage = mediaMsg.imageMessage;
            }

            const msg = generateWAMessageFromContent(m.from, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: menuText
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: config.footer
                            }),
                            header: proto.Message.InteractiveMessage.Header.create(headerObj),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: [
                                    {
                                        "name": "quick_reply",
                                        "buttonParamsJson": `{"display_text":"🏓 Ping Bot","id":"${prefix}ping"}`
                                    },
                                    {
                                        "name": "quick_reply",
                                        "buttonParamsJson": `{"display_text":"👑 Owner","id":".owner"}`
                                    }
                                ]
                            })
                        })
                    }
                }
            }, {});

            await sock.relayMessage(m.from, msg.message, {
                messageId: msg.key.id
            });
        } catch (e) {
            console.log("Interactive Message Error:", e);
            await m.reply(menuText);
        }
    }
};
