import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IamDocs } from '../../swagger';

export class AskForRecoveryPasswordInput {
  @ApiProperty(IamDocs.Authentication.AskForRecoveryPasswordInput.email)
  @IsString()
  email: string;
}
