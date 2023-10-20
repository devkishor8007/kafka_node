require('dotenv').config()
const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
const port = process.env.PORT;

// Create a Kafka client
const kafka = new Kafka({
    clientId: process.env.CLIENT_ID,
    brokers: [process.env.BROKER1]
});

// Create a producer
const producer = kafka.producer();

app.get('/', async (req, res) => {
    await producer.connect();
    await producer.send({
        topic: 'my-topic',
        messages: [
            { value: 'Hello KafkaJS useraaaa!' },
        ],
    });

    await producer.disconnect();

    res.send('Message sent to Kafka!');
});

const consumer = kafka.consumer({ groupId: 'my-group' });

const run = async () => {
    // Consuming
    await consumer.connect();
    await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value.toString(),
            });
        },
    });

    // Disconnect after 10 seconds
    setTimeout(async () => {
        await consumer.disconnect();
        console.log('Consumer disconnected');
    }, 10000);
};

run().catch(console.error);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});