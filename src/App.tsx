import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SupportPage } from './pages/SupportPage';
import { DeveloperSupportPage } from './pages/DeveloperSupportPage';
import { MessagesPage } from './pages/MessagesPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { ModerationPage } from './pages/ModerationPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/favorites"><CollectionPage favoritesOnly /></Route>
      <Route path="/profile"><CollectionPage /></Route>
      <Route path="/support" component={SupportPage} />
      <Route path="/developer-support" component={DeveloperSupportPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/moderation" component={ModerationPage} />
      <Route path="/users/:id" component={PublicProfilePage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
