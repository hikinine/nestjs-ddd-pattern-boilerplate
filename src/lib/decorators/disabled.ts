import { DISABLED_CONTROLLER_KEY } from '@lib/common';
import { SetMetadata } from '@nestjs/common';

export const DisabledMethod = (message?: string) =>
  SetMetadata(DISABLED_CONTROLLER_KEY, {
    disabled: true,
    message,
  });
