import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { IamDocs } from '../../swagger';

export abstract class SignInInput {
  @ApiProperty(IamDocs.Authentication.SignInInput.email)
  @IsString()
  email: string;

  @ApiProperty(IamDocs.Authentication.SignInInput.password)
  @IsString()
  password: string;

  @ApiProperty(IamDocs.Authentication.SignInInput.keepMeLoggedIn)
  @IsBoolean()
  keepMeLoggedIn: boolean;
}
