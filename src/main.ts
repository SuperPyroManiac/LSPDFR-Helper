import { ShardingManager } from 'discord.js';
import { config } from 'dotenv';
import { ShardUtils } from './Functions/ShardUtils';

config({ path: '../.env' });

async function main() {
  const manager = new ShardingManager('./dist/bot.js', {
    token: process.env['TOKEN'],
    totalShards: 4,
    shardList: [0, 1, 2, 3],
    mode: 'worker',
  });
  await ShardUtils.setManager(manager);

  manager.on('shardCreate', (_shard) => {
    console.log(`Launched shard ${_shard.id}`);
  });

  await manager.spawn();
}

void main();
