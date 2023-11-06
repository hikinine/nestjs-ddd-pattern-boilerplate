import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export abstract class RecoveryPasswordInput {
  @ApiProperty()
  @IsString()
  token: string;
  @ApiProperty()
  @IsString()
  password: string;
}
