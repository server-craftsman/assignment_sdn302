import { IsString, IsOptional, MinLength } from "class-validator";

export class UpdateCategoryDto {
  @IsString()
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  user_id?: string;

  constructor(data: Partial<UpdateCategoryDto> = {}) {
    this.name = data.name || "";
    this.description = data.description;
    this.user_id = data.user_id;
  }
}
