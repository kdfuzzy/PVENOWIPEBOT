const fs = require('fs');
const path = require('path');

// 📁 Railway persistent storage
const dataPath = '/data/economy.json';

// Ensure file exists
function ensureFile() {
    const dir = path.dirname(dataPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({}, null, 2));
    }
}

// Load data
function loadData() {
    ensureFile();
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

// Save data
function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Create user
function createUser(data, id) {
    if (!data[id]) {
        data[id] = {
            balance: 0,
            wins: 0,
            losses: 0
        };
    }
}

// 💎 Format SOL
function formatSol(amount) {
    return `◎ ${amount.toFixed(2)} SOL`;
}

// Get balance
function getBalance(id) {
    const data = loadData();
    return data[id]?.balance || 0;
}

// Add balance
function addBalance(id, amount) {
    const data = loadData();
    createUser(data, id);

    data[id].balance += amount;
    saveData(data);
}

// Remove balance
function removeBalance(id, amount) {
    const data = loadData();
    createUser(data, id);

    data[id].balance -= amount;
    if (data[id].balance < 0) data[id].balance = 0;

    saveData(data);
}

// Reset
function resetBalance(id) {
    const data = loadData();

    data[id] = {
        balance: 0,
        wins: 0,
        losses: 0
    };

    saveData(data);
}

// Win / Loss
function addWin(id) {
    const data = loadData();
    createUser(data, id);

    data[id].wins += 1;
    saveData(data);
}

function addLoss(id) {
    const data = loadData();
    createUser(data, id);

    data[id].losses += 1;
    saveData(data);
}

// Stats
function getStats(id) {
    const data = loadData();
    return data[id] || { balance: 0, wins: 0, losses: 0 };
}

module.exports = {
    getBalance,
    addBalance,
    removeBalance,
    resetBalance,
    addWin,
    addLoss,
    getStats,
    formatSol
};
