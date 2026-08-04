import { Link, useLocation } from 'wouter';

export function SimpleHeader() {
  const [, setLocation] = useLocation();

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/');
    }
  }

  return (
    <header className="simple-header">
      <button className="simple-header__back" type="button" onClick={goBack} aria-label="Назад">←</button>
      <Link className="brand" href="/"><span className="brand__mark">A</span><span>Art Swap</span></Link>
    </header>
  );
}
