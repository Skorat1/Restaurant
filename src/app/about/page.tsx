export default function About() {
  const values = [
    { title: "Seasonal Sourcing", detail: "We partner with local producers to create menus defined by freshness and provenance." },
    { title: "Immersive Service", detail: "Every table receives thoughtful attention from arrival through the final course." },
    { title: "Artful Presentation", detail: "Plates are crafted with dramatic detail and refined textures for a complete visual experience." }
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 space-y-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Our story</span>
          <h1 className="text-4xl font-serif tracking-tight text-white sm:text-5xl">A modern dining house shaped by classic hospitality rituals.</h1>
          <p className="max-w-2xl text-neutral-400 leading-8">
            L&apos;Étoile Dorée is a premium culinary destination that blends elevated technique, sustainable sourcing, and refined service for unforgettable shared moments.
          </p>
        </div>
        <div className="rounded-[2rem] border border-neutral-800/80 bg-neutral-900/90 p-10 shadow-2xl shadow-black/20">
          <h2 className="text-2xl font-semibold text-white">Our heritage</h2>
          <p className="mt-4 text-neutral-400 leading-7">
            Rooted in contemporary French gastronomy, our kitchen honors classical foundations while delivering a bold, contemporary perspective.
          </p>
          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl bg-neutral-950/90 p-6">
              <p className="text-3xl font-serif text-amber-400">2026</p>
              <p className="mt-2 text-sm text-neutral-400">Established as a boutique fine dining destination with a seasonal tasting menu.</p>
            </div>
            <div className="rounded-3xl bg-neutral-950/90 p-6">
              <p className="text-3xl font-serif text-amber-400">3×</p>
              <p className="mt-2 text-sm text-neutral-400">Award-winning recognition for sustainable hospitality and design-driven cuisine.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {values.map(value => (
          <article key={value.title} className="rounded-3xl border border-neutral-800/70 bg-neutral-900/80 p-8 shadow-lg shadow-black/10 transition hover:-translate-y-1">
            <h3 className="text-xl font-semibold text-white">{value.title}</h3>
            <p className="mt-3 text-sm leading-7 text-neutral-400">{value.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}