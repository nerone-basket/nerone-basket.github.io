'use client';

import { useMemo, useState } from 'react';
import Link from '@/components/site-link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assetPath, sitePath } from '@/lib/paths';

type RosterCardPlayer = {
  id: string;
  name: string;
  number: number | null;
  photo?: string;
};

type SortOption = 'surname' | 'number';

function surnameOf(name: string) {
  const value = name.trim().split(/\s+/).slice(1).join(' ');
  return value === '…' ? null : value;
}

function compareBySurname(first: RosterCardPlayer, second: RosterCardPlayer) {
  const firstSurname = surnameOf(first.name);
  const secondSurname = surnameOf(second.name);
  if (firstSurname === null) return secondSurname === null ? first.name.localeCompare(second.name, 'it') : 1;
  if (secondSurname === null) return -1;

  return firstSurname.localeCompare(secondSurname, 'it')
    || first.name.localeCompare(second.name, 'it');
}

export function RosterGrid({
  playersBySeason,
  seasons,
  initialSeason,
}: {
  playersBySeason: Record<string, RosterCardPlayer[]>;
  seasons: string[];
  initialSeason: string;
}) {
  const [season, setSeason] = useState(initialSeason);
  const [sortBy, setSortBy] = useState<SortOption>('number');
  const players = playersBySeason[season] ?? [];
  const sortedPlayers = useMemo(() => [...players].sort((first, second) => {
    if (sortBy === 'number') {
      const firstNumber = first.number ?? Number.POSITIVE_INFINITY;
      const secondNumber = second.number ?? Number.POSITIVE_INFINITY;
      return firstNumber - secondNumber || compareBySurname(first, second);
    }
    return compareBySurname(first, second);
  }), [players, sortBy]);

  return (
    <>
      <div className="roster-toolbar">
        <p><strong>{players.length}</strong> giocatori · {season.replace('-', '/')}</p>
        <div className="roster-filters">
          <label htmlFor="roster-season-filter">
            <span>Stagione</span>
            <Select value={season} onValueChange={(value) => value && setSeason(value)}>
              <SelectTrigger id="roster-season-filter" className="filter-trigger"><SelectValue /></SelectTrigger>
              <SelectContent>{seasons.map((item) => <SelectItem value={item} key={item}>{item.replace('-', '/')}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label htmlFor="roster-sort-filter">
            <span>Ordina per</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger id="roster-sort-filter" className="filter-trigger"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="surname">Cognome</SelectItem>
                <SelectItem value="number">Numero di maglia</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      </div>

      <div className="roster-grid">
        {sortedPlayers.map((player) => (
          <Link href={sitePath(`/giocatori/${player.id}`)} className="player-card" key={player.id}>
            <figure className={player.photo ? '' : 'player-placeholder'}>
              <img src={assetPath(player.photo || '/assets/logo-bianco.png')} alt={player.photo ? player.name : ''} />
            </figure>
            <div className="player-card-meta">
              <span className="player-card-number">{player.number ?? '—'}</span>
              <span className="player-card-name"><strong>{player.name}</strong></span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
