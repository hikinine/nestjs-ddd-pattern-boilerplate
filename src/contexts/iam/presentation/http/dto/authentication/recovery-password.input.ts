import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IamDocs } from '../../swagger';

export abstract class RecoveryPasswordInput {
  @ApiProperty(IamDocs.Authentication.RecoveryPasswordInput.token)
  @IsString()
  token: string;
  @ApiProperty(IamDocs.Authentication.RecoveryPasswordInput.password)
  @IsString()
  password: string;
}
