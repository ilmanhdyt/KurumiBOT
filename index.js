const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('baileys-pro');
const pino = require('pino');
const handler = require('./handler');
const config = require('./config');
const chalk = require('chalk');
const readline = require('readline');
const cfonts = require('cfonts');
const ora = require('ora');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

let pairingRequested = false;

async function startBot() {
    console.clear();
    cfonts.say(config.botName, {
        font: 'block',
        align: 'center',
        colors: ['cyan', 'blue'],
        background: 'transparent',
        letterSpacing: 1,
        lineHeight: 1,
        space: true,
        maxLength: '0',
    });

    const spinner = ora('Menyiapkan koneksi WhatsApp...').start();

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    spinner.text = `Starting ${config.botName} using WA v${version.join('.')}, isLatest: ${isLatest}`;

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // 
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        
        if (qr && config.pairingCode && !sock.authState.creds.registered && !pairingRequested) {
            pairingRequested = true;
            spinner.stop();
            let phoneNumber = await question(chalk.cyan('\n[SYSTEM] Masukkan nomor WhatsApp Anda (Contoh: 628xxx): '));
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            spinner.start('Meminta kode pairing dari WhatsApp...');

            try {
                const code = await sock.requestPairingCode(phoneNumber);
                spinner.stopAndPersist({ symbol: '🔑', text: chalk.green(`Kode Pairing Anda: ${code}`) });
                console.log(chalk.yellow('\n[SYSTEM] Masukkan kode di atas ke WhatsApp > Perangkat Tertaut > Tautkan Perangkat > Tautkan dengan Nomor Telepon'));
            } catch (err) {
                spinner.fail(chalk.red('Gagal mendapatkan kode pairing: ' + err.message));
            }
        } else if (qr && !config.pairingCode) {
            // Fallback ke QR code jika pairingCode false
            spinner.stop();
            const qrcode = require('qrcode-terminal');
            qrcode.generate(qr, { small: true });
            console.log(chalk.cyan('[SYSTEM] Scan QR Code di atas untuk menautkan bot.'));
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            spinner.fail(chalk.red('Connection closed: ' + (lastDisconnect.error?.message || 'Unknown')));
            
            if (shouldReconnect) {
                console.log(chalk.yellow('[SYSTEM] Mencoba menghubungkan kembali...'));
                pairingRequested = false;
                startBot();
            } else {
                console.log(chalk.red('[SYSTEM] Logged out. Hapus folder session dan jalankan ulang.'));
                process.exit(1);
            }
        } else if (connection === 'open') {
            pairingRequested = false;
            spinner.succeed(chalk.green(`${config.botName} Berhasil Terhubung!`));
            console.log(chalk.cyan(`[SYSTEM] Bot siap menerima pesan. Ketik ${config.prefix}menu di WhatsApp.\n`));
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const m = messages[0];
        await handler(sock, m);
    });

    
    process.on('uncaughtException', (err) => {
        console.error(chalk.red('[UNCAUGHT EXCEPTION]'), err);
    });
    process.on('unhandledRejection', (err) => {
        console.error(chalk.red('[UNHANDLED REJECTION]'), err);
    });
}

startBot();
