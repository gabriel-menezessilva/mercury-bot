import TelegramBot from 'node-telegram-bot-api';
import { emoji } from 'node-emoji';

import { token } from './environment';

const bot = new TelegramBot(token, { polling: true });

import { conectarMongoDB, desconectarMongoDB } from './infra/Mongo';

import { doScrap } from './scrapper';

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match ? match[1] : '';

    bot.sendMessage(chatId, resp);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === '/echo') {
        bot.sendMessage(chatId, 'Pensamento do dia: quem nasceu primeiro, o ovo ou a galinha?');

    } else if (msg.text === '/subscribe') {
        try {
            let client = await conectarMongoDB();
            let db = client.db('MercuryBot');
            let collection = db.collection('users');
            let usuarios = await collection.find({}).toArray();
            for (let usuario of usuarios) {
                if (chatId == usuario.telegramId) {
                    bot.sendMessage(chatId, 'Você já está inscrito para atualizações!');
                    await desconectarMongoDB(client);
                    return;
                }
            }
            let camarada = {
                telegramId: chatId,
                nome: msg.chat.first_name,
                sobrenome: msg.chat.last_name,
                dataCadastro: Date.now()
            }
            collection.insertOne(camarada, async (err, resultado) => {
                if (err) {
                    console.log(err);
                    return;
                }
                bot.sendMessage(chatId, "Inscrição realizada com sucesso!");
                await desconectarMongoDB(client);
            });
        } catch (e) {
            bot.sendMessage(chatId, 'Não foi possível realizar a inscrição!');
            console.log(e);
        }
    } else if (msg.text === '/unsubscribe') {
        try {
            let client = await conectarMongoDB();
            let db = client.db('MercuryBot');
            let collection = db.collection('users');
            await collection.deleteOne({ telegramId: chatId }, async (err, resultado) => {
                if (err) {
                    console.log(err);
                    bot.sendMessage(chatId, 'Erro ao desinscrever você...');
                } else {
                    bot.sendMessage(chatId, 'Desinscrição realizada com sucesso!');
                }
                await desconectarMongoDB(client);
            });
        } catch (e) {
            bot.sendMessage(chatId, 'Erro ao desinscrever você...');
            console.log(e);
        }
    } else {
        bot.sendMessage(chatId, `Olá, eu sou o Mercúrio Bot ${emoji.robot_face}. Estou aqui para auxiliá-lo com seu agendamento.
        \nAs opções possíveis são:\n\t\t/echo -> Interagir comigo\n\t\t/subscribe -> Você se inscreve para
        receber atualizações de agendamentos \n\t\t/unsubscribe -> Você para de receber minhas mensagens
        chatas\nEstou ansioso para interagir com você!`);
    }


});

async function analisaSubscricoesAtualizaDados() {

    let dados = await doScrap();
    console.log(dados)

    try {
        let client = await conectarMongoDB();
        let db = client.db('MercuryBot');
        let collection = db.collection('users');
        let usuarios = await collection.find({}).toArray();
        for (let usuario of usuarios) {
            bot.sendMessage(usuario.telegramId, JSON.stringify(dados));
        }

        await desconectarMongoDB(client);
    } catch (e) {
        console.log(e);
    }
}

const interval = setInterval(analisaSubscricoesAtualizaDados, 60000)
