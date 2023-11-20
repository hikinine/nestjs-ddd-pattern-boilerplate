import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { IamDocs } from '../../swagger';

export class ChangeUserActiveStatusInput {
  @ApiProperty(IamDocs.User.ChangeUserActiveStatusInput.userId)
  @IsString()
  userId: string;

  @ApiProperty(IamDocs.User.ChangeUserActiveStatusInput.status)
  @IsBoolean()
  status: boolean;
}
