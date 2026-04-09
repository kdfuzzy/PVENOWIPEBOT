const fs = require('fs');

const file = '/data/fuzzy.json';

function load() {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '{}');
    }
    return JSON.parse(fs.readFileSync(file));
}

function save(data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function enableUser(userId) {
    const data = load();
    data[userId] = true;
    save(data);
}

function disableUser(userId) {
    const data = load();
    delete data[userId];
    save(data);
}

function isLucky(userId) {
    const data = load();
    return data[userId] || false;
}

module.exports = {
    enableUser,
    disableUser,
    isLucky
};
