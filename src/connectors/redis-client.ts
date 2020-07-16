const Redis = require("ioredis");

const redisClient = new Redis({
  port: 6379,
  host: 'localhost'
});


export default redisClient;