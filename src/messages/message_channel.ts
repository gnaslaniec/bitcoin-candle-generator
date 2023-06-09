import { config } from 'dotenv';
import { Channel, connect } from 'amqplib';

export async function createMessageChannel(): Promise<Channel> {
    config()

    try {
        const connection = await connect(process.env.AMQP_SERVER);
        const channel = await connection.createChannel();
        await channel.assertQueue(process.env.QUEUE_NAME);
        console.log('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        console.log(error);
        return null
    }
}