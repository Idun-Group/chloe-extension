// init-mongo.js
// Init replica set + (re)création user admin si besoin
rs.initiate({
    _id: 'rs0',
    members: [{ _id: 0, host: 'mongodb:27017' }],
});

// Attendre que le RS soit prêt (simple retry)
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
async function waitPrimary() {
    for (let i = 0; i < 20; i++) {
        try {
            const status = rs.status();
            if (
                status.members &&
                status.members.some((m) => m.stateStr === 'PRIMARY')
            )
                return;
        } catch (e) {}
        await sleep(500);
    }
}
waitPrimary();
