const fs = require('fs');
const DB_FILE = './data.json';

function getDB() {
    return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getBalance(userId) {
    const db = getDB();
    return db[userId]?.balance || 0;
}

function addBalance(userId, amount) {
    const db = getDB();

    if (!db[userId]) {
        db[userId] = { balance: 0 };
    }

    db[userId].balance += amount;
    saveDB(db);
}

function removeBalance(userId, amount) {
    const db = getDB();

    if (!db[userId]) {
        db[userId] = { balance: 0 };
    }

    db[userId].balance -= amount;
    saveDB(db);
}

module.exports = {
    getBalance,
    addBalance,
    removeBalance
};
