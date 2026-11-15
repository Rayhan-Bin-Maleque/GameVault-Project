import { PartialType } from '@nestjs/swagger';
import { CreateGameDto } from './create-game.dto.js';

export class PartialUpdateGameDto extends PartialType(CreateGameDto, {
  skipNullProperties: false,
}) {}
