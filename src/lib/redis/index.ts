import { create } from "domain";
import { createClient, RedisClientType } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;

export default async function(): Promise<RedisClient> {

	if (client == null) {
		client = createClient();
		await client.connect();
	};

	return client;
};




