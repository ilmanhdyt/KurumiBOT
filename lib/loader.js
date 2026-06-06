const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const chalk = require('chalk');

class PluginLoader {
    constructor(pluginDir) {
        this.pluginDir = pluginDir;
        this.plugins = new Map();
        this.init();
    }

    init() {
        if (!fs.existsSync(this.pluginDir)) {
            fs.mkdirSync(this.pluginDir, { recursive: true });
        }

        // Load initially
        const files = fs.readdirSync(this.pluginDir).filter(f => f.endsWith('.js'));
        for (const file of files) {
            this.loadPlugin(file);
        }

        // Watch for changes
        const watcher = chokidar.watch(this.pluginDir, { ignored: /(^|[\/\\])\../, persistent: true });

        watcher
            .on('add', file => this.loadPlugin(path.basename(file)))
            .on('change', file => this.reloadPlugin(path.basename(file)))
            .on('unlink', file => this.unloadPlugin(path.basename(file)));
            
        console.log(chalk.green(`[SYSTEM] Successfully loaded ${this.plugins.size} plugins.`));
    }

    loadPlugin(file) {
        try {
            const pluginPath = path.join(this.pluginDir, file);
            const plugin = require(pluginPath);
            
            if (plugin.command) {
                this.plugins.set(file, plugin);
            }
        } catch (e) {
            console.error(chalk.red(`[ERROR] Failed to load plugin ${file}:`), e);
        }
    }

    reloadPlugin(file) {
        try {
            const pluginPath = path.join(this.pluginDir, file);
            delete require.cache[require.resolve(pluginPath)];
            const plugin = require(pluginPath);
            
            if (plugin.command) {
                this.plugins.set(file, plugin);
                console.log(chalk.blue(`[SYSTEM] Plugin reloaded: ${file}`));
            }
        } catch (e) {
            console.error(chalk.red(`[ERROR] Failed to reload plugin ${file}:`), e);
        }
    }

    unloadPlugin(file) {
        this.plugins.delete(file);
        const pluginPath = path.join(this.pluginDir, file);
        delete require.cache[require.resolve(pluginPath)];
        console.log(chalk.yellow(`[SYSTEM] Plugin removed: ${file}`));
    }

    getPlugins() {
        return Array.from(this.plugins.values());
    }
}

module.exports = new PluginLoader(path.join(__dirname, '../plugins'));
