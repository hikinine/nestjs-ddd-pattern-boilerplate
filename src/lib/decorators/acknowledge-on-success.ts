import { RmqContext } from '@nestjs/microservices';

export function AcknowledgeOnSuccess() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        await originalMethod.apply(this, args);
        const [context] = args;
        if (!(context instanceof RmqContext)) {
          throw new Error('context is not instance of RmqContext');
        }

        const channel = context.getChannelRef();
        const originalMessage = context.getMessage();
        await channel.ack(originalMessage);
      } catch (error) {
        console.log('acknowledge error', error);
      }
    };
    return descriptor;
  };
}
