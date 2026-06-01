import { Channel } from "amqplib";

export interface Consumer {
  start(channel: Channel): Promise<void>;
}
