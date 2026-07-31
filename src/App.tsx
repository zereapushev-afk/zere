import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SupportPage } from './pages/SupportPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/favorites"><CollectionPage favoritesOnly /></Route>
      <Route path="/profile"><CollectionPage /></Route>
      <Route path="/support" component={SupportPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
