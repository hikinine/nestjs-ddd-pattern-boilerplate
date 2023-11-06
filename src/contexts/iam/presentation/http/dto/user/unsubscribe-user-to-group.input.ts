import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export abstract class UnsubscribeUserToGroupInput {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  groupId: string;
}
