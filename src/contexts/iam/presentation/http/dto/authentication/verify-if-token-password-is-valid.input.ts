import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IamDocs } from '../../swagger';

export abstract class VerifyIfTokenPasswordIsValidInput {
  @ApiProperty(IamDocs.Authentication.VerifyIfTokenPasswordIsValidInput.token)
  @IsString()
  token: string;
}
