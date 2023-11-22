import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IamDocs } from '../../swagger';

export abstract class UnsubscribeUserToGroupInput {
  @ApiProperty(IamDocs.User.SubscribeUserToGroupInput.userId)
  @IsString()
  userId: string;

  @ApiProperty(IamDocs.User.SubscribeUserToGroupInput.groupId)
  @IsString()
  groupId: string;
}
