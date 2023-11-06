import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class ChangeUserActiveStatusInput {
  @ApiProperty({ description: 'ID do usuário' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Novo status do usuário' })
  @IsBoolean()
  status: boolean;
}
