import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export abstract class AuthenticateWithRefreshTokenInput {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
