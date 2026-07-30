export type Artwork = {
  id: string;
  title: string;
  author: string;
  category: string;
  city: string;
  imageUrl?: string;
  offer: string;
  color: string;
};

export const categories = ['Все работы', 'Анимация', 'Музыка', 'Иллюстрация', 'Другое'];

export const artworks: Artwork[] = [];
