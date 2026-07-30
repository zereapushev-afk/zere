import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/favorites"><CollectionPage favoritesOnly /></Route>
      <Route path="/profile"><CollectionPage /></Route>
      <Route component={NotFoundPage} />
    </Switch>
  );
}
