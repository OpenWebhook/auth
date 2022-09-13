import { createClient } from 'redis';

export abstract class RedisService {
  public readonly client: ReturnType<typeof createClient>;
}
