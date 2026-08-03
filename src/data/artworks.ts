export type Artwork = {
  id: string;
  title: string;
  author: string;
  authorId: string;
  authorAvatarUrl?: string;
  category: string;
  city: string;
  imageUrl?: string;
  filePath?: string;
  offer: string;
  color: string;
};

export const categories = ['Все работы', 'Анимация', 'Музыка', 'Иллюстрация', 'Другое'];

export const artworks: Artwork[] = [];
