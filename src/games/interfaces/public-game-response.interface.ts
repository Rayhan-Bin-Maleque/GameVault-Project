import { GameResponse } from './game-response.interface.js';

export type PublicGameReponse = Pick<
  GameResponse,
  | 'id'
  | 'title'
  | 'description'
  | 'price'
  | 'imageUrl'
  | 'releaseDate'
  | 'categories'
  | 'publisher'
>;
