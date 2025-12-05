import { IsInt, IsPositive, IsString, Length } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  name: string;
  @Length(2, 15, { groups: ['create'] })
  @Length(3, 15, { groups: ['update'] })
  @IsString()
  description: string;
  @IsInt()
  @IsPositive({ always: true })
  price: number;
}
