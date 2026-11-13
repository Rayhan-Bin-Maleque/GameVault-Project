export interface GameResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  releaseDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categories: string[];
  publisher: {
    publisherName: string;
  };
}
