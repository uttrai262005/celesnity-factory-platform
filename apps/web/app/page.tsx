import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Celesnity Factory Platform</h1>
      <nav aria-label="Primary">
        <ul>
          <li>
            <Link href="/data-sources">Data Sources</Link>
          </li>
          <li>
            <Link href="/production-lines">Production Lines</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
