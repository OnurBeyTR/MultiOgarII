// Library imports
const fs = require("fs");

// Project imports
const FakeSocket = require('./FakeSocket');
const PacketHandler = require('../PacketHandler');
const BotPlayer = require('./BotPlayer');
const MinionPlayer = require('./MinionPlayer');

class BotLoader {
    constructor(server) {
        this.server = server;
        this.botCount = 0;
    }
    addBot() {
        // Create a FakeSocket instance and assign it's properties.
        const socket = new FakeSocket(this.server);
        socket.playerTracker = new BotPlayer(this.server, socket);
        socket.packetHandler = new PacketHandler(this.server, socket);

        let name = "";
        // Check if name file exists, if so pick a random name and apply it to the bot.
        if(fs.existsSync("./ai/botnames.txt")) {
            const file = fs.readFileSync("./ai/botnames.txt", "utf-8").split("\n");
            name = file[Math.floor(Math.random() * Math.floor(file.length))];
        } else {
            name = `Bot | ${this.botCount++}`;
        };

        // Add to client list and spawn.
        this.server.clients.push(socket);
        socket.packetHandler.setNickname(name);
    }
    addMinion(owner, name, mass) {
        // Aliases
        const maxSize = this.server.config.minionMaxStartSize;
        const defaultSize = this.server.config.minionStartSize;

        // Create a FakeSocket instance and assign it's properties.
        const socket = new FakeSocket(this.server);
        socket.playerTracker = new MinionPlayer(this.server, socket, owner);
        socket.packetHandler = new PacketHandler(this.server, socket);

        // Set minion spawn size
        socket.playerTracker.spawnmass = mass || maxSize > defaultSize ? Math.floor(Math.random() * (maxSize - defaultSize) + defaultSize) : defaultSize;

        // Add to client list
        this.server.clients.push(socket);

        // Add to world
        socket.packetHandler.setNickname(name == "" || !name ? this.server.config.defaultName : name);
    }
}

module.exports = BotLoader;
