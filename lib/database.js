const fs = require('fs');
const path = require('path');

class Database {
    constructor(dir) {
        this.dir = dir;
        this.usersPath = path.join(dir, 'users.json');
        this.groupsPath = path.join(dir, 'groups.json');
        this.settingsPath = path.join(dir, 'settings.json');

        this.users = {};
        this.groups = {};
        this.settings = {};

        this.init();
    }

    init() {
        if (!fs.existsSync(this.dir)) {
            fs.mkdirSync(this.dir, { recursive: true });
        }
        
        this.users = this.readDB(this.usersPath, {});
        this.groups = this.readDB(this.groupsPath, {});
        this.settings = this.readDB(this.settingsPath, {});

        // Auto-save every 10 seconds to prevent file corruption from writing on every message
        setInterval(() => this.save(), 10000);
    }

    readDB(file, defaultData) {
        try {
            if (fs.existsSync(file)) {
                const data = fs.readFileSync(file, 'utf8');
                return JSON.parse(data || '{}');
            }
        } catch (e) {
            console.error(`Failed to read database ${file}:`, e);
        }
        return defaultData;
    }

    save() {
        try {
            fs.writeFileSync(this.usersPath, JSON.stringify(this.users, null, 2));
            fs.writeFileSync(this.groupsPath, JSON.stringify(this.groups, null, 2));
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
        } catch (e) {
            console.error('Failed to save database:', e);
        }
    }

    // Helper for user data creation
    getUser(id) {
        if (!this.users[id]) {
            this.users[id] = {
                id: id,
                name: 'Unknown',
                registered: false,
                registerDate: null,
                money: 0,
                bank: 0,
                limit: 10
            };
        }
        return this.users[id];
    }
    
    getGroup(id) {
        if (!this.groups[id]) {
            this.groups[id] = {
                id: id,
                mute: false,
                welcome: false,
                leave: false
            };
        }
        return this.groups[id];
    }
}

module.exports = new Database(path.join(__dirname, '../database'));
