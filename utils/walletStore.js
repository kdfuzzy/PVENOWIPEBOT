const { PublicKey } = require("@solana/web3.js");

const wallets = new Map(); 
// userId -> { address, challenge, verified }

function createChallenge(userId, address) {
    const challenge = `Discord wallet link verification: ${userId}-${Date.now()}`;
    wallets.set(userId, { address, challenge, verified: false });
    return challenge;
}

function verifySignature(userId, signature) {
    const data = wallets.get(userId);
    if (!data) return false;

    try {
        const pubKey = new PublicKey(data.address);
        const message = Buffer.from(data.challenge);
        const signatureBuffer = Buffer.from(signature, "base64");

        return pubKey.verify(message, signatureBuffer);
    } catch (e) {
        console.error(e);
        return false;
    }
}

function markVerified(userId) {
    const data = wallets.get(userId);
    if (data) data.verified = true;
}

function getWallet(userId) {
    return wallets.get(userId);
}

module.exports = { wallets, createChallenge, verifySignature, markVerified, getWallet };
