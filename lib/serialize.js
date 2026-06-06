const { proto, getContentType, jidNormalizedUser } = require('baileys-pro');

function serialize(sock, m) {
    if (!m) return m;
    if (m.key) {
        m.id = m.key.id;
        m.isSelf = m.key.fromMe;
        m.from = m.key.remoteJid;
        m.isGroup = m.from.endsWith('@g.us');
        m.sender = m.isGroup ? jidNormalizedUser(m.key.participant) : jidNormalizedUser(m.key.fromMe ? sock.user.id : m.from);
    }
    
    if (m.message) {
        m.type = getContentType(m.message);
        m.msg = (m.type === 'viewOnceMessage' || m.type === 'viewOnceMessageV2') 
            ? m.message[m.type].message[getContentType(m.message[m.type].message)] 
            : m.message[m.type];
            
        // Text parsing
        let text = m.message.conversation || 
            (m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text : '') || 
            (m.type === 'imageMessage' && m.message.imageMessage.caption) || 
            (m.type === 'videoMessage' && m.message.videoMessage.caption) || '';

        if (m.type === 'interactiveResponseMessage') {
            try {
                const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
                if (params.id) text = params.id;
            } catch (e) {}
        } else if (m.type === 'templateButtonReplyMessage') {
            text = m.message.templateButtonReplyMessage.selectedId;
        } else if (m.type === 'buttonsResponseMessage') {
            text = m.message.buttonsResponseMessage.selectedButtonId;
        }

        m.text = text || '';
            
        // Reply function
        m.reply = async (text, options = {}) => {
            return sock.sendMessage(m.from, { text: text, ...options }, { quoted: m });
        };
    }
    
    return m;
}

module.exports = { serialize };
