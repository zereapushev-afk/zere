export type Artwork = {
  id: number;
  title: string;
  author: string;
  category: string;
  city: string;
  image: string;
  offer: string;
  color: string;
};

export const categories = ['Все работы', 'Анимация', 'Музыка', 'Иллюстрация'];

export const artworks: Artwork[] = [];
