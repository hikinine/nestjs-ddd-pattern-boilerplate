import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserInput {
  @ApiProperty({
    description: 'Nome do usuário',
    default: 'John Doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Cargo do usuário',
    default: 'Desenvolvedor',
  })
  @IsString()
  office: string;

  @ApiProperty({
    description: 'Senha do usuário',
    default: '12345678',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Email do usuário',
    default: 'john@newsun.energy',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    default: '(11) 11111-9999',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'BitrixId do usuário caso queira ser vinculado ',
  })
  @IsString()
  @IsOptional()
  externalUserProviderId?: string;
}
