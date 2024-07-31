const { Client } = require("pg"); // Postgres client
const redis = require("redis"); //redis client

let dbClient;
let redisClient;
let isCached = false;
let results;

async function init() {
	
	dbClient = new Client({
        password: process.env.POSTGRES_PASSWORD,
        user: process.env.POSTGRES_USER,
	    host: "postgres",
	    database: "foundation",
	});
	await dbClient.connect();

    console.log(`Postgres connected to foundation db`);

    const redisConnectionString = "redis://redis:6379";
    redisClient = redis.createClient({ url: redisConnectionString });
    redisClient.on("error", (error) => console.error(`Error : ${error}`));
    await redisClient.connect();

    console.log(`Redis connected ${redisConnectionString}`);

	return;
}

async function teardown() {
    await dbClient.end();
    await redisClient.end();
	return
}

async function queryReturn(query,cacheKey,expireKey = 3600) {

    try {
        const cacheResults = await redisClient.get(cacheKey);

        if (cacheResults) {
          isCached = true;
          results = JSON.parse(cacheResults);
        } else {
          
            const dbResults = await dbClient
                .query(query)
                .then((payload) => {
                return payload.rows;
                })
                .catch(() => {
                console.log(`Query ${query} failed`);
                throw new Error("Query failed");
            });

            results = dbResults;

            //Set Query results in Redis Cache
            redisClient.set(cacheKey, JSON.stringify(results), parseInt((+new Date)/1000) + expireKey);

        }
    } catch (error) {
        console.error(error);
        results = `{"error":"We're sorry, the service encountered an error."}`;
    }

    return results;
}

async function queryExecute(query){

    dbClient.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Data execute successful');
    });
    
    return;
}

module.exports = {
	init,
    teardown,
    queryReturn,
    queryExecute,
};