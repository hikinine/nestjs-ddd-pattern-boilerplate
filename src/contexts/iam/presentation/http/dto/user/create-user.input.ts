import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';
import { IamDocs } from '../../swagger';

export class CreateUserInput {
  @ApiProperty(IamDocs.User.CreateUserInput.firstName)
  @IsString()
  firstName: string;

  @ApiProperty(IamDocs.User.CreateUserInput.lastName)
  @IsString()
  lastName: string;

  @ApiProperty(IamDocs.User.CreateUserInput.office)
  @IsString()
  office: string;

  @ApiProperty(IamDocs.User.CreateUserInput.email)
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty(IamDocs.User.CreateUserInput.phone)
  @IsString()
  phone: string;

  @ApiProperty(IamDocs.User.CreateUserInput.avatar)
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty(IamDocs.User.CreateUserInput.gender)
  @IsString()
  @IsOptional()
  gender?: 'M' | 'F' | 'O';

  @ApiProperty(IamDocs.User.CreateUserInput.birthday)
  @IsDate()
  @IsOptional()
  birthday?: Date;
}
