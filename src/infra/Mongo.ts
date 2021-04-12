import { MongoClient } from 'mongodb';
import { mongoUri } from './../environment';

async function conectarMongoDB() {
    const client = new MongoClient(mongoUri, { useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Conexão estabelecida com sucesso!');
        return client;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

async function desconectarMongoDB(client: MongoClient) {
    if (client) {
        try {
            await client.close();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export { conectarMongoDB, desconectarMongoDB }