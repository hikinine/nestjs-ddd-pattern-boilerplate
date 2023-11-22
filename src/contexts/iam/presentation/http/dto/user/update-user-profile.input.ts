import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsObject, IsOptional, IsString } from 'class-validator';
import { IamDocs } from '../../swagger';

export class UpdateUserProfileInput {
  @ApiProperty(IamDocs.User.UpdateUserProfileInput.userId)
  @IsString()
  userId: string;

  @ApiProperty(IamDocs.User.UpdateUserProfileInput.firstName)
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty(IamDocs.User.UpdateUserProfileInput.lastName)
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty(IamDocs.User.UpdateUserProfileInput.office)
  @IsString()
  @IsOptional()
  office?: string;

  @ApiProperty(IamDocs.User.UpdateUserProfileInput.phone)
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty(IamDocs.User.UpdateUserProfileInput.avatar)
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty(IamDocs.User.UpdateUserProfileInput.birthday)
  @IsDate()
  @IsOptional()
  birthday?: Date;

  @ApiProperty(IamDocs.User.UpdateUserProfileInput.gender)
  @IsOptional()
  @IsString()
  gender: 'M' | 'F' | 'O';

  @ApiProperty(IamDocs.User.UpdateUserProfileInput.address)
  @IsOptional()
  @IsObject()
  address: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    extra?: string;
    zipCode?: string;
  };
}
