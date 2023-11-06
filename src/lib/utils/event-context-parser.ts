import { DomainEvent } from '@hiki9/rich-domain/dist/core';
import { RmqContext } from '@nestjs/microservices';

export function eventContextParser<Event extends DomainEvent<unknown>>(
  context: RmqContext,
): Event {
  const message = context.getMessage();
  const content = message.content;
  const event = JSON.parse(Buffer.from(content).toString());
  return event.data;
}
