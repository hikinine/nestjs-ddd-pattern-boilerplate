import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserInput {
  @ApiProperty({
    description: 'Id do usuário',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Nome do usuário',
    default: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Cargo do usuário',
    default: 'Desenvolvedor',
    required: false,
  })
  @IsString()
  @IsOptional()
  office?: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    default: '(11) 11111-9999',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
