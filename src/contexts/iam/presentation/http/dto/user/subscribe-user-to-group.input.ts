import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export abstract class SubscribeUserToGroupInput {
  @ApiProperty()
  @IsString()
  @Length(1)
  userId: string;

  @ApiProperty()
  @IsString()
  groupId: string;
}
