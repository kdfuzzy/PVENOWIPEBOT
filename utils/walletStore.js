const wallets = new Map();      // userId -> { address, verified }
const challenges = new Map();   // userId -> { challenge, address }

function addChallenge(userId, challenge, address) {
    challenges.set(userId, { challenge, address });
}

function getChallenge(userId) {
    return challenges.get(userId);
}

function verifyWallet(userId) {
    const data = challenges.get(userId);
    if (!data) return null;
    wallets.set(userId, { address: data.address, verified: true });
    challenges.delete(userId);
    return wallets.get(userId);
}

function getWallet(userId) {
    return wallets.get(userId);
}

module.exports = { addChallenge, getChallenge, verifyWallet, getWallet };
