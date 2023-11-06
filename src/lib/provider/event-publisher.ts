import { Application } from '@hiki9/rich-domain/dist';
import { DomainEvent } from '@hiki9/rich-domain/dist/core';
import { ApplicationQueueKey } from '@lib/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EventPublisher implements Application.EventPublisher<unknown> {
  constructor(
    @Inject(ApplicationQueueKey) private readonly publisher: ClientProxy,
  ) {}

  public publish(event: DomainEvent<any>): void {
    this.publisher.emit(event.eventName, event);
  }
}
