import { config } from 'dotenv';
import axios from 'axios';
import Candle from './models/candle';
import Period from './enums/period';
import { createMessageChannel } from './messages/message_channel';

config();

async function readMarketPrice(): Promise<number> {
    const result = await axios.get(process.env.API_URL);
    const data = result.data;
    const price = data.bitcoin.usd;
    return price;
}

async function generateCandles(): Promise<Candle> {
    const messageChannel = await createMessageChannel();

    while (true) {
        const loopTimes = Period.ONE_MINUTE / Period.TEN_SECONDS;
        const candle = new Candle('BTC');

        for (let i = 0; i < loopTimes; i++) {
            const price = await readMarketPrice();
            candle.addValue(price);
            await new Promise(r => setTimeout(r, Period.TEN_SECONDS));
        }
        candle.closeCandle();
        const candleObj = candle.toSimpleObject();
        const candleJson = JSON.stringify(candleObj);
        messageChannel.sendToQueue(process.env.QUEUE_NAME, Buffer.from(candleJson));
        console.log('Candle sent to queue');
    }
}



generateCandles();