// utils/walletStore.js
const wallets = new Map(); // userId -> wallet info

function addWallet(userId, address) {
    wallets.set(userId, { address, verified: true });
}

function getWallet(userId) {
    return wallets.get(userId);
}

function getAllWallets() {
    return wallets;
}

module.exports = { addWallet, getWallet, getAllWallets };
