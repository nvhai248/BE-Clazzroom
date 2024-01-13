const amqp = require("amqplib");
const pool = require("generic-pool");

// Create pool for connection
const connectionPool = pool.createPool(
  {
    // if you running in localhost the connection pool: amqp://localhost
    // if you running in docker the connection pool: amqp://{{docker container}}/port
    // amqp://rbmq-container:5672
    create: async () => await amqp.connect("amqp://localhost"),
    destroy: async (connection) => await connection.close(),
  },
  { min: 1, max: 10 }
); // Change number of connections

// Create pool for channel
const channelPool = pool.createPool(
  {
    create: async () => {
      const connection = await connectionPool.acquire();
      return await connection.createChannel();
    },
    destroy: async (channel) => await channel.close(),
  },
  { min: 1, max: 10 }
);

module.exports = {
  channelPool,
};
