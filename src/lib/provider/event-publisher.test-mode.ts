import { Application } from '@hiki9/rich-domain/dist';
import { DomainEvent } from '@hiki9/rich-domain/dist/core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventPublisherTestingFactory
  implements Application.EventPublisher<unknown>
{
  public publish(event: DomainEvent<any>): void {
    //console.log('[Publisher]: ', event.eventName);
  }
}
