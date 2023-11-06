import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('APP')
  .setDescription('The APP')
  .setVersion('1.0')
  .addCookieAuth('@ac')
  .build();
