const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('baileys-pro');

module.exports = {
    command: ['sc', 'sourcecode'],
    category: 'main',
    description: 'Menampilkan source code bot',

    async execute({ sock, m, config, prefix }) {
        const scText = 
`╭─〔 SOURCE CODE 〕
│ 
│ 🤖 Bot  : ${config.botName}
│ 👨‍💻 Dev  : ${config.ownerName}
│ 
│ 📂 Repository
│ github.com/ilmanhdyt/kurumibot
│ 
│ 📌 Language  : JavaScript
│ 📦 Library   : Baileys-Pro
│ 🗄️ Database  : JSON Local
│ 
│ ⭐ Jangan lupa kasih bintang
│    di repository-nya ya!
╰──────────────`;

        try {
            let mediaMsg = null;
            try {
                mediaMsg = await prepareWAMessageMedia(
                    { image: { url: config.thumbnail } },
                    { upload: sock.waUploadToServer }
                );
            } catch (err) {
                console.log('[SC] Thumbnail gagal dimuat:', err.message);
            }

            const headerObj = {
                title: '',
                subtitle: '',
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
                                text: scText
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: config.footer
                            }),
                            header: proto.Message.InteractiveMessage.Header.create(headerObj),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: [
                                    {
                                        name: 'quick_reply',
                                        buttonParamsJson: `{"display_text":"👑 Owner","id":"${prefix}owner"}`
                                    },
                                    {
                                        name: 'quick_reply',
                                        buttonParamsJson: `{"display_text":"📋 Menu","id":"${prefix}iyam"}`
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
            console.error('[SC] Interactive message error:', e);
            // Fallback plain text
            await m.reply(
                `${scText}\n\n👑 Owner : wa.me/${config.owner[0]}\n📂 Repo  : github.com/ilmanhdyt/kurumibot`
            );
        }
    }
};
