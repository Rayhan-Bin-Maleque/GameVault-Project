import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto.js';

export class PartialUpdateGameDto extends PartialType(CreateGameDto) {}
