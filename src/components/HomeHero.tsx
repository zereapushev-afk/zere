type HomeHeroProps = {
  onPublish: () => void;
};

export function HomeHero({ onPublish }: HomeHeroProps) {
  return (
    <section className="hero">
      <span className="eyebrow">Творчество находит новый дом</span>
      <h1>Art Swap —<br /><em>обмен творческих работ</em></h1>
      <p>Делись работами в любом формате, находи близкое тебе творчество и предлагай честный обмен.</p>
      <div className="hero__actions">
        <a className="button" href="#gallery">Смотреть работы</a>
        <button className="text-button" onClick={onPublish}>Выложить свою →</button>
      </div>
    </section>
  );
}
