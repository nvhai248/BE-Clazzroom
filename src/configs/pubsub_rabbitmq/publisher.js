const { channelPool } = require("./pool");

// function publishMessage used pool connection and  pool channel
async function publishMessage(topic, message) {
  const channel = await channelPool.acquire();
  const exchangeName = "notifications"; // exchange's name

  await channel.assertExchange(exchangeName, "topic", { durable: false });

  const messageData = JSON.stringify({ topic, message });

  channel.publish(exchangeName, topic, Buffer.from(messageData));
  console.log(`Message sent to topic '${topic}':`, message);

  channelPool.release(channel); // Return channel to pool
}

module.exports = { publishMessage };
