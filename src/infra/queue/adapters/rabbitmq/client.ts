import amqplib from "amqplib";
import { Channel, ChannelModel } from "amqplib";

import { env } from "@/config/env";

import { Exchanges } from "./exchanges";

export class RabbitMQClient {
  private _model: ChannelModel | null = null;
  private _channel: Channel | null = null;

  public async connect(): Promise<void> {
    this._model = await amqplib.connect(env.RABBITMQ_URL);
    this._channel = await this._model.createChannel();
    await this._channel.prefetch(env.RABBITMQ_PREFETCH);
    await this._channel.assertExchange(Exchanges.Main, "direct", { durable: true });
    await this._channel.assertExchange(Exchanges.Dead, "topic", { durable: true });
  }

  public async disconnect(): Promise<void> {
    await this._channel?.close();
    await this._model?.close();
    this._channel = null;
    this._model = null;
  }

  public get channel(): Channel {
    if (!this._channel) throw new Error("RabbitMQClient is not connected. Call connect() first.");
    return this._channel;
  }
}
