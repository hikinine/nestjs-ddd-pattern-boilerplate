import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AskForRecoveryPasswordInput {
  @ApiProperty()
  @IsString()
  email: string;
}
