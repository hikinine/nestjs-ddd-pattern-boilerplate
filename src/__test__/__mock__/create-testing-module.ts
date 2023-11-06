import { GlobalModule } from '@app/global.module';
import { EventPublisher, EventPublisherTestingFactory } from '@lib/provider';
import { Test, TestingModule } from '@nestjs/testing';

interface Props {
  imports?: any[];
  override?: {
    provider: any;
    useClass: any;
  }[];
}
export async function createTestingModule(props: Props) {
  props.imports.push(GlobalModule);

  let tempModule = Test.createTestingModule({
    imports: props.imports,
  })
    .overrideProvider(EventPublisher)
    .useClass(EventPublisherTestingFactory);

  props?.override?.forEach?.((override) => {
    tempModule = tempModule
      .overrideProvider(override.provider)
      .useClass(override.useClass);
  });

  const moduleFixture: TestingModule = await tempModule.compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}
