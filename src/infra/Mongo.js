const { MongoClient } = require('mongodb');
const mongoUri = require('./../environment').mongoUri;

async function conectarMongoDB() {
    const client = new MongoClient(mongoUri, { useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Conexão estabelecida com sucesso!');
        return client;
    } catch (e) {
        console.log(e)
    }
}

async function desconectarMongoDB(client) {
    if (client) {
        try {
            await client.close();
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = { conectarMongoDB, desconectarMongoDB }