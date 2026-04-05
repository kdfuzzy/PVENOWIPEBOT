const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data.json');

// 📂 GET DATA
function getData() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(filePath));
}

// 💾 SAVE DATA
function saveData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 🧱 ENSURE USER EXISTS
function ensureUser(data, userId) {
    if (!data[userId]) {
        data[userId] = {
            balance: 0,
            stats: {
                wins: 0,
                losses: 0
            },
            wallet: null
        };
    }
}

// 💰 BALANCE
function getBalance(userId) {
    const data = getData();
    return data[userId]?.balance || 0;
}

function addBalance(userId, amount) {
    const data = getData();
    ensureUser(data, userId);

    data[userId].balance += amount;
    saveData(data);
}

function removeBalance(userId, amount) {
    const data = getData();
    ensureUser(data, userId);

    data[userId].balance -= amount;
    saveData(data);
}

// 📊 STATS
function addWin(userId) {
    const data = getData();
    ensureUser(data, userId);

    data[userId].stats.wins += 1;
    saveData(data);
}

function addLoss(userId) {
    const data = getData();
    ensureUser(data, userId);

    data[userId].stats.losses += 1;
    saveData(data);
}

function getStats(userId) {
    const data = getData();
    return data[userId]?.stats || { wins: 0, losses: 0 };
}

// 🏆 ALL USERS (for leaderboard)
function getAllUsers() {
    return getData();
}

// 🔗 WALLET
function setWallet(userId, address) {
    const data = getData();
    ensureUser(data, userId);

    data[userId].wallet = address;
    saveData(data);
}

function getWallet(userId) {
    const data = getData();
    return data[userId]?.wallet || null;
}

module.exports = {
    getBalance,
    addBalance,
    removeBalance,
    addWin,
    addLoss,
    getStats,
    getAllUsers,
    setWallet,
    getWallet
};
