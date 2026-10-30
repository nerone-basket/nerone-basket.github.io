'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, CalendarDays, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { drawGraphic, LOGOS, SPONSORS, sponsorGlassSize, type Appointment, type Glass, type GraphicState, type GraphicType, type WeekFormat, type WeekMatch } from '@/lib/graphic-generator';
import './graphic-generator.css';

export type SiteGame = {
  id: string; date: string; time: string; club: 'nerone' | 'nerone-bounganvillae';
  homeId: string; awayId: string; home: string; away: string; homeLogo: string; awayLogo: string;
  competition: string; address: string; homeScore: number | null; awayScore: number | null;
};

const TYPE_LABELS: Record<GraphicType, string> = { calendario: 'Calendario', week: 'Week', matchday: 'Matchday', risultato: 'Risultato' };
const defaultWeekMatch: WeekMatch = {
  gameId: '', title: 'NEXT MATCH', homeTeam: 'NERONE', awayTeam: 'SAMURAI',
  homeLogo: '/assets/logo-testo-bianco.png', awayLogo: '/assets/teams/2026-27/samurai.png',
  competition: 'Campionato Amatori UISP Giornata 15', dateTime: 'Mercoledì 21 Ottobre, 21:00',
  address: 'Via Olimpica, 46B (4Kasette) Anzio (RM)',
};
const initialState: GraphicState = {
  type: 'calendario', month: 'OTTOBRE 2026', leftName: 'NERONE', rightName: 'NERONE BGV',
  appointments: [], sponsor: 'maisondali', photo: '', subjectPhoto: '', photoX: 0, photoY: 0, photoZoom: 1,
  weekFormat: 'post', backgroundBlur: 0,
  glasses: [{ id: 'glass-1', kind: 'match', x: 58, y: 54, width: 440, height: 500, layer: 'behind', match: { ...defaultWeekMatch } }, { id: 'glass-2', kind: 'match', x: 568, y: 734, width: 440, height: 500, layer: 'front', match: { ...defaultWeekMatch } }, { id: 'glass-sponsor', kind: 'sponsor', x: 58, y: 1127, width: 388, height: 161, layer: 'front', sponsorId: 'mastroianni' }],
  homeTeam: 'NERONE', awayTeam: 'SAMURAI',
  homeLogo: '/assets/logo-testo-bianco.png', awayLogo: '/assets/teams/2026-27/samurai.png',
  competition: 'Campionato Amatori UISP Giornata 15', dateTime: 'Mercoledì 21 Ottobre, 21:00',
  address: 'Via Olimpica, 46B (4Kasette) Anzio (RM)', homeScore: '76', awayScore: '51', resultClubSide: 'home',
  matchdayBackground: '#c80b1d', matchdaySubject: '', matchdayTeamName: 'NERONE BASKET ANZIO', matchdayPlayerName: 'NOME GIOCATORE',
  matchdayDate: '2026-10-21', matchdayTime: '21:00', matchdaySubjectX: 0, matchdaySubjectY: 0, matchdaySubjectZoom: 1,
};

function parseCsv(source: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '"' && quoted && source[i + 1] === '"') { field += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[i + 1] === '\n') i++;
      row.push(field); if (row.some(cell => cell.trim())) rows.push(row);
      row = []; field = '';
    } else field += char;
  }
  row.push(field); if (row.some(cell => cell.trim())) rows.push(row);
  return rows;
}
function csvCell(value: string) { return `"${value.replaceAll('"', '""')}"`; }
function formattedDate(date: string) {
  const value = new Date(`${date}T12:00:00`);
  return Number.isNaN(value.getTime()) ? date : new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(value);
}
function formattedDateTime(date: string, time: string) {
  return `${formattedDate(date)}, ${time || 'orario da definire'}`;
}
function weekMatchFromGame(game?: SiteGame): WeekMatch {
  if (!game) return { ...defaultWeekMatch, gameId: '', homeTeam: '', awayTeam: '', homeLogo: '', awayLogo: '', competition: '', dateTime: '', address: '' };
  return {
    gameId: game.id, title: 'NEXT MATCH', homeTeam: game.home, awayTeam: game.away,
    homeLogo: game.homeLogo, awayLogo: game.awayLogo, competition: game.competition,
    dateTime: formattedDateTime(game.date, game.time), address: game.address,
  };
}
function newId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function gameAppointment(game: SiteGame): Appointment {
  const atHome = game.homeId === game.club;
  return { id: game.id, club: game.club, date: game.date, time: game.time, opponent: atHome ? game.away : game.home, atHome };
}
function matchdayLogo(teamId: string, fallback: string) {
  return teamId === 'nerone' ? '/assets/logo-bianco.png'
    : teamId === 'nerone-bounganvillae' ? '/assets/bgv-bianco.png' : fallback;
}
function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="gg-field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} /></label>;
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <label className="gg-field"><span>{label}</span><select value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="gg-field gg-color-field"><span>{label}</span><div className="gg-color-control"><input type="color" aria-label="Seleziona colore dello sfondo" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#c80b1d'} onChange={event => onChange(event.target.value)} /><input type="text" aria-label="Colore dello sfondo HEX" inputMode="text" maxLength={7} value={value.toUpperCase()} onChange={event => onChange(event.target.value)} /></div></div>;
}

export function GraphicGenerator({ games, teamLogos }: { games: SiteGame[]; teamLogos: { id: string; name: string; logo: string }[] }) {
  const [state, setState] = useState<GraphicState>(() => ({
    ...initialState,
    glasses: initialState.glasses.map((glass, index) => glass.kind === 'match' ? { ...glass, match: weekMatchFromGame(games[index]) } : glass),
  }));
  const [selectedGame, setSelectedGame] = useState('');
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderId = useRef(0);
  const csvInput = useRef<HTMLInputElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const photoFile = useRef<File | null>(null);
  const photoVersion = useRef(0);
  const canvasHeight = state.type === 'week' && state.weekFormat === 'story' ? 1920 : 1350;
  const update = <K extends keyof GraphicState>(key: K, value: GraphicState[K]) => { setMessage(''); setState(current => ({ ...current, [key]: value })); };
  function updateTeam(side: 'home' | 'away', value: string) {
    setMessage('');
    setState(current => {
      const homeTeam = side === 'home' ? value : current.homeTeam;
      const awayTeam = side === 'away' ? value : current.awayTeam;
      const isNerone = (team: string) => /^nerone(?:$|[\s_-])/i.test(team.trim());
      const resultClubSide = isNerone(homeTeam) && !isNerone(awayTeam) ? 'home'
        : isNerone(awayTeam) && !isNerone(homeTeam) ? 'away' : 'none';
      return { ...current, homeTeam, awayTeam, resultClubSide };
    });
  }

  useEffect(() => {
    const id = ++renderId.current;
    const frame = document.createElement('canvas');
    setReady(false);
    drawGraphic(frame, state).then(() => {
      if (renderId.current !== id || !canvasRef.current) return;
      const target = canvasRef.current;
      target.width = frame.width; target.height = frame.height;
      target.getContext('2d')?.drawImage(frame, 0, 0);
      setReady(true);
    }).catch(error => { if (renderId.current === id) { setReady(false); setMessage(error instanceof Error ? error.message : 'Errore nella generazione.'); } });
  }, [state]);

  useEffect(() => {
    let active = true;
    sponsorGlassSize('mastroianni').then(size => {
      if (!active) return;
      setState(current => ({ ...current, glasses: current.glasses.map(glass => glass.kind === 'sponsor' && glass.id === 'glass-sponsor' && glass.sponsorId === 'mastroianni'
        ? { ...glass, ...size, y: (current.weekFormat === 'story' ? 1920 : 1350) - size.height - 62 }
        : glass) }));
    }).catch(() => { /* Keep the initial dimensions if the logo cannot load. */ });
    return () => { active = false; };
  }, []);

  function pickGame(gameId: string) {
    setSelectedGame(gameId);
    const game = games.find(item => item.id === gameId);
    if (!game) return;
    setMessage('');
    setState(current => ({ ...current,
      homeTeam: game.home, awayTeam: game.away,
      homeLogo: current.type === 'risultato' ? (LOGOS.find(logo => logo.id === game.homeId)?.mono || '') : current.type === 'matchday' ? matchdayLogo(game.homeId, game.homeLogo) : game.homeLogo,
      awayLogo: current.type === 'risultato' ? (LOGOS.find(logo => logo.id === game.awayId)?.mono || '') : current.type === 'matchday' ? matchdayLogo(game.awayId, game.awayLogo) : game.awayLogo,
      competition: game.competition, dateTime: formattedDateTime(game.date, game.time),
      address: game.address, homeScore: game.homeScore == null ? current.homeScore : String(game.homeScore),
      awayScore: game.awayScore == null ? current.awayScore : String(game.awayScore),
      resultClubSide: game.homeId === game.club ? 'home' : game.awayId === game.club ? 'away' : 'none',
      matchdayTeamName: game.club === 'nerone-bounganvillae' ? 'NERONE BGV' : 'NERONE BASKET ANZIO',
      matchdayDate: game.date, matchdayTime: game.time,
    }));
  }
  function importMonth() {
    const month = state.month.trim().toLocaleLowerCase('it-IT');
    const filtered = games.filter(game => {
      const date = new Date(`${game.date}T12:00:00`);
      return !Number.isNaN(date.getTime()) && new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(date).toLocaleLowerCase('it-IT') === month;
    });
    const limited = filtered.filter((game, index, all) => all.slice(0, index).filter(previous => previous.club === game.club).length < 6);
    update('appointments', limited.map(gameAppointment));
    setMessage(filtered.length > limited.length ? `${limited.length} partite importate. ${filtered.length - limited.length} non entrano nella grafica: crea un secondo calendario per quelle partite.` : filtered.length ? `${filtered.length} partite importate dal calendario.` : 'Nessuna partita trovata per questo mese nel calendario del sito.');
  }
  function downloadCsv() {
    const head = ['club', 'date', 'time', 'opponent', 'at_home'];
    const rows = games.map(game => { const a = gameAppointment(game); return [a.club, a.date, a.time, a.opponent, a.atHome ? 'true' : 'false']; });
    const csv = [head, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'calendario-nerone-2026-27.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function uploadCsv(file?: File) {
    if (!file) return;
    const rows = parseCsv(await file.text());
    const header = rows.shift()?.map(cell => cell.trim().toLowerCase().replace(/^\ufeff/, '')) ?? [];
    const col = (row: string[], name: string) => row[header.indexOf(name)]?.trim() ?? '';
    if (!header.includes('date') || (!header.includes('opponent') && !header.includes('home_team'))) {
      setMessage('CSV non riconosciuto: servono date e opponent, oppure le colonne del calendario del sito.'); return;
    }
    const appointments = rows.map(row => {
      const club = col(row, 'club') || (col(row, 'home_team').startsWith('nerone') ? col(row, 'home_team') : col(row, 'away_team'));
      if (club !== 'nerone' && club !== 'nerone-bounganvillae') return null;
      const atHome = header.includes('at_home') ? /^(true|1|si|sì|casa)$/i.test(col(row, 'at_home')) : col(row, 'home_team') === club;
      return { id: newId(), club, date: col(row, 'date'), time: col(row, 'time'), opponent: col(row, 'opponent') || (atHome ? col(row, 'away_team') : col(row, 'home_team')), atHome } satisfies Appointment;
    }).filter((a): a is Appointment => a !== null);
    const limited = appointments.filter((a, index, all) => all.slice(0, index).filter(previous => previous.club === a.club).length < 6);
    update('appointments', limited);
    setMessage(appointments.length > limited.length ? `${limited.length} appuntamenti importati. ${appointments.length - limited.length} non entrano nella grafica: crea un secondo calendario.` : `${limited.length} appuntamenti importati dal CSV.`);
    if (csvInput.current) csvInput.current.value = '';
  }
  async function uploadPhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage('Seleziona un file immagine.'); return; }
    const version = ++photoVersion.current;
    photoFile.current = file;
    const reader = new FileReader();
    reader.onload = () => { if (version === photoVersion.current) { setMessage(''); setState(current => ({ ...current, photo: String(reader.result ?? ''), subjectPhoto: '' })); } };
    reader.readAsDataURL(file);
  }
  function uploadMatchdaySubject(file?: File) {
    if (!file) return;
    if (file.type !== 'image/png') { setMessage('Per Matchday carica un file PNG già scontornato.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setMessage(''); setState(current => ({ ...current, matchdaySubject: String(reader.result ?? '') })); };
    reader.onerror = () => setMessage('Impossibile leggere il PNG del giocatore.');
    reader.readAsDataURL(file);
  }
  async function uploadSubject(file?: File) {
    if (!file) return;
    if (file.type !== 'image/png') { setMessage('Carica un PNG trasparente.'); return; }
    if (!photoFile.current) { setMessage('Carica prima la foto di sfondo.'); return; }
    const version = photoVersion.current;
    try {
      const [source, cutout] = await Promise.all([createImageBitmap(photoFile.current), createImageBitmap(file)]);
      const sameSize = source.width === cutout.width && source.height === cutout.height;
      source.close(); cutout.close();
      if (!sameSize) { setMessage('Il PNG del soggetto deve avere le stesse dimensioni della foto originale.'); return; }
      const reader = new FileReader();
      reader.onload = () => { if (version === photoVersion.current) { setMessage('Ritaglio del soggetto caricato.'); setState(current => ({ ...current, subjectPhoto: String(reader.result ?? '') })); } };
      reader.readAsDataURL(file);
    } catch { setMessage('Impossibile leggere il PNG del soggetto.'); }
  }
  function changeWeekFormat(format: WeekFormat) {
    setState(current => {
      if (current.weekFormat === format) return current;
      const fromHeight = current.weekFormat === 'story' ? 1920 : 1350;
      const toHeight = format === 'story' ? 1920 : 1350;
      return { ...current, weekFormat: format, glasses: current.glasses.map(glass => ({
        ...glass, y: glass.kind === 'sponsor' ? toHeight - glass.height - 62
          : Math.round(Math.min(toHeight - glass.height, glass.y * toHeight / fromHeight)),
      })) };
    });
  }
  function downloadPng() {
    if (!ready || !canvasRef.current) return;
    canvasRef.current.toBlob(blob => {
      if (!blob) { setMessage('Download non riuscito.'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `nerone-${state.type}${state.type === 'week' ? `-${state.weekFormat}` : ''}-${Date.now()}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }
  function updateAppointment(id: string, patch: Partial<Appointment>) {
    if (patch.club && state.appointments.filter(item => item.club === patch.club && item.id !== id).length >= 6) { setMessage('Questa colonna contiene già 6 partite.'); return; }
    update('appointments', state.appointments.map(item => item.id === id ? { ...item, ...patch } : item));
  }
  function updateGlass(id: string, patch: Partial<Pick<Glass, 'x' | 'y' | 'width' | 'height' | 'layer'>>) {
    setState(current => ({ ...current, glasses: current.glasses.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, ...patch };
      const height = current.weekFormat === 'story' ? 1920 : 1350;
      return { ...next, x: Math.max(0, Math.min(1080 - next.width, next.x)), y: Math.max(0, Math.min(height - next.height, next.y)) };
    }) }));
  }
  function updateGlassMatch(id: string, patch: Partial<WeekMatch>) {
    setMessage('');
    setState(current => ({ ...current, glasses: current.glasses.map(item => item.id === id && item.kind === 'match' ? { ...item, match: { ...item.match, ...patch } } : item) }));
  }
  function pickWeekGame(id: string, gameId: string) {
    const game = games.find(item => item.id === gameId);
    if (!game) { updateGlassMatch(id, { gameId: '' }); return; }
    setMessage('');
    setState(current => ({ ...current, glasses: current.glasses.map(item => item.id === id && item.kind === 'match' ? { ...item, match: { ...weekMatchFromGame(game), title: item.match.title } } : item) }));
  }
  async function changeGlassSponsor(id: string, sponsorId: string) {
    setState(current => ({ ...current, glasses: current.glasses.map(item => item.id === id && item.kind === 'sponsor' ? { ...item, sponsorId } : item) }));
    try {
      const size = await sponsorGlassSize(sponsorId);
      setState(current => ({ ...current, glasses: current.glasses.map(item => item.id === id && item.kind === 'sponsor' && item.sponsorId === sponsorId
        ? { ...item, ...size, x: Math.min(item.x, 1080 - size.width), y: Math.max(0, item.y + item.height - size.height) }
        : item) }));
    } catch { setMessage('Impossibile caricare il logo dello sponsor.'); }
  }
  function addGlass() {
    const game = games.find(item => !state.glasses.some(glass => glass.kind === 'match' && glass.match.gameId === item.id));
    const lowerY = state.weekFormat === 'story' ? 1210 : 734;
    const slots = [{ x: 58, y: 54 }, { x: 568, y: 54 }, { x: 58, y: lowerY }, { x: 568, y: lowerY }];
    const position = slots.find(slot => !state.glasses.some(glass => Math.abs(glass.x - slot.x) < 200 && Math.abs(glass.y - slot.y) < 200)) ?? { x: 320, y: 420 };
    setMessage('');
    setState(current => ({ ...current, glasses: [...current.glasses, { id: newId(), kind: 'match', ...position, width: 440, height: 500, layer: 'front', match: weekMatchFromGame(game) }] }));
  }
  function pointerPosition(event: React.PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * 1080 / bounds.width, y: (event.clientY - bounds.top) * canvasHeight / bounds.height };
  }
  function pointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (state.type !== 'week') return;
    const p = pointerPosition(event);
    const found = [...state.glasses].reverse().find(g => p.x >= g.x && p.x <= g.x + g.width && p.y >= g.y && p.y <= g.y + g.height);
    if (found) { drag.current = { id: found.id, dx: p.x - found.x, dy: p.y - found.y }; event.currentTarget.setPointerCapture(event.pointerId); }
  }
  function pointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drag.current) return;
    const p = pointerPosition(event); const active = drag.current;
    setState(current => ({ ...current, glasses: current.glasses.map(g => g.id === active.id ? { ...g, x: Math.round(Math.max(0, Math.min(1080 - g.width, p.x - active.dx))), y: Math.round(Math.max(0, Math.min(canvasHeight - g.height, p.y - active.dy))) } : g) }));
  }

  const logoOptions = state.type === 'risultato'
    ? LOGOS.filter(item => item.mono).map(item => ({ value: item.mono, label: item.name }))
    : [{ value: '/assets/logo-testo-bianco.png', label: 'Nerone · bianco' }, { value: '/assets/logo-bianco.png', label: 'Nerone · simbolo' }, { value: '/assets/bgv-bianco.png', label: 'Nerone BGV · simbolo' }, ...teamLogos.map(item => ({ value: item.logo, label: item.name }))]
      .filter((item, index, all) => all.findIndex(candidate => candidate.value === item.value) === index);
  const nextClub: Appointment['club'] | null = state.appointments.filter(a => a.club === 'nerone').length < 6 ? 'nerone' : state.appointments.filter(a => a.club === 'nerone-bounganvillae').length < 6 ? 'nerone-bounganvillae' : null;
  const sponsorOptions = SPONSORS.map(item => ({ value: item.id, label: item.name }));
  return <main className="gg">
    <header className="gg-top"><div><span className="gg-mark">N / B</span><div><p>NERONE BASKET ANZIO · STAGIONE 26/27</p><h1>Graphic Generator</h1></div></div><span className="gg-top-badge">Studio social</span></header>
    <div className="gg-shell">
      <div className="gg-editor">
        <div className="gg-intro"><p className="gg-eyebrow">01 / SCEGLI IL FORMATO</p><h2>Crea la grafica</h2><p>Compila i contenuti, controlla l’anteprima e scarica il post pronto per Instagram.</p></div>
        <div className="gg-types" role="group" aria-label="Tipo di grafica">{(Object.keys(TYPE_LABELS) as GraphicType[]).map(type => <button key={type} type="button" className={state.type === type ? 'active' : ''} onClick={() => { setSelectedGame(''); setMessage(''); setState(current => ({ ...current, type, sponsor: type === 'calendario' ? 'maisondali' : type === 'matchday' ? 'superette' : type === 'risultato' ? 'silviomarsili' : current.sponsor, homeTeam: type === 'risultato' || type === 'matchday' ? 'NERONE' : current.homeTeam, awayTeam: type === 'risultato' ? 'CIAMPINO' : type === 'week' || type === 'matchday' ? 'SAMURAI' : current.awayTeam, homeLogo: type === 'risultato' ? '/assets/teams/2026-27/mono_white/nerone_white_text.png' : type === 'matchday' ? '/assets/logo-bianco.png' : '/assets/logo-testo-bianco.png', awayLogo: type === 'risultato' ? '/assets/teams/2026-27/mono_white/ciampino_white.png' : '/assets/teams/2026-27/samurai.png', resultClubSide: type === 'risultato' ? 'home' : current.resultClubSide })); }}>{TYPE_LABELS[type]}</button>)}</div>

        <Fragment key={state.type}>

        {state.type === 'week' && <section className="gg-panel"><div className="gg-panel-head"><span>01</span><h3>Formato Week</h3></div><div className="gg-format-choice" role="group" aria-label="Formato Week"><button type="button" className={state.weekFormat === 'post' ? 'active' : ''} aria-pressed={state.weekFormat === 'post'} onClick={() => changeWeekFormat('post')}>Post <small>1080 × 1350</small></button><button type="button" className={state.weekFormat === 'story' ? 'active' : ''} aria-pressed={state.weekFormat === 'story'} onClick={() => changeWeekFormat('story')}>Storia <small>1080 × 1920</small></button></div></section>}

        {state.type === 'calendario' ? <>
          <section className="gg-panel"><div className="gg-panel-head"><span>01</span><h3>Intestazione</h3></div><div className="gg-grid"><Field label="Mese e anno" value={state.month} onChange={value => update('month', value)} placeholder="OTTOBRE 2026" /><Field label="Squadra sinistra" value={state.leftName} onChange={value => update('leftName', value)} /><Field label="Squadra destra" value={state.rightName} onChange={value => update('rightName', value)} /></div></section>
          <section className="gg-panel"><div className="gg-panel-head"><span>02</span><h3>Appuntamenti</h3></div><p className="gg-help">Inserisci le partite a mano, importa il mese dal sito o carica un CSV. Fino a 6 appuntamenti per colonna mantengono la grafica leggibile.</p><div className="gg-actions"><button type="button" onClick={importMonth}><CalendarDays size={16} /> Importa mese dal sito</button><button type="button" onClick={downloadCsv}><ArrowDownToLine size={16} /> Scarica CSV sito</button><label className="gg-csv-upload">Carica CSV<input ref={csvInput} type="file" accept=".csv,text/csv" onChange={event => uploadCsv(event.target.files?.[0])} /></label></div>
            {state.appointments.map((item, index) => <div className="gg-appointment" key={item.id}><div className="gg-row-title"><strong>Partita {index + 1}</strong><button type="button" aria-label={`Elimina partita ${index + 1}`} onClick={() => update('appointments', state.appointments.filter(a => a.id !== item.id))}><Trash2 size={17} /></button></div><div className="gg-grid"><Select label="Squadra" value={item.club} onChange={value => updateAppointment(item.id, { club: value as Appointment['club'] })} options={[{ value: 'nerone', label: state.leftName }, { value: 'nerone-bounganvillae', label: state.rightName }]} /><Field label="Data" type="date" value={item.date} onChange={value => updateAppointment(item.id, { date: value })} /><Field label="Ora" type="time" value={item.time} onChange={value => updateAppointment(item.id, { time: value })} /><Field label="Avversaria" value={item.opponent} onChange={value => updateAppointment(item.id, { opponent: value })} /><Select label="Campo" value={item.atHome ? 'home' : 'away'} onChange={value => updateAppointment(item.id, { atHome: value === 'home' })} options={[{ value: 'home', label: 'Casa' }, { value: 'away', label: 'Trasferta' }]} /></div></div>)}
            <button className="gg-add" type="button" disabled={!nextClub} onClick={() => { if (nextClub) update('appointments', [...state.appointments, { id: newId(), club: nextClub, date: '', time: '21:00', opponent: '', atHome: true }]); }}><Plus size={17} /> Aggiungi partita</button>
          </section>
        </> : state.type === 'matchday' ? <>
          <section className="gg-panel"><div className="gg-panel-head"><span>01</span><h3>Partita</h3></div>
            <div className="gg-grid">
              <Select label="Prendi dal calendario" value={selectedGame} onChange={pickGame} options={[{ value: '', label: 'Seleziona una partita' }, ...games.map(game => ({ value: game.id, label: `${game.date} · ${game.home} – ${game.away}` }))]} />
              <Field label="Nome squadra in alto" value={state.matchdayTeamName} onChange={value => update('matchdayTeamName', value)} />
              <Field label="Squadra di casa" value={state.homeTeam} onChange={value => updateTeam('home', value)} />
              <Field label="Squadra ospite" value={state.awayTeam} onChange={value => updateTeam('away', value)} />
              <Select label="Logo casa · reso bianco" value={state.homeLogo} onChange={value => update('homeLogo', value)} options={[{ value: '', label: 'Nessuno' }, ...logoOptions]} />
              <Select label="Logo ospite · reso bianco" value={state.awayLogo} onChange={value => update('awayLogo', value)} options={[{ value: '', label: 'Nessuno' }, ...logoOptions]} />
            </div>
          </section>
          <section className="gg-panel"><div className="gg-panel-head"><span>02</span><h3>Dettagli</h3></div>
            <div className="gg-grid">
              <Field label="Data" type="date" value={state.matchdayDate} onChange={value => update('matchdayDate', value)} />
              <Field label="Ora" type="time" value={state.matchdayTime} onChange={value => update('matchdayTime', value)} />
              <Field label="Luogo" value={state.address} onChange={value => update('address', value)} />
              <Field label="Nome giocatore" value={state.matchdayPlayerName} onChange={value => update('matchdayPlayerName', value)} />
            </div>
          </section>
          <section className="gg-panel"><div className="gg-panel-head"><span>03</span><h3>Sfondo e giocatore</h3></div>
            <div className="gg-grid"><ColorField label="Colore dello sfondo" value={state.matchdayBackground} onChange={value => update('matchdayBackground', value)} /></div>
            <label className="gg-upload gg-matchday-upload"><ImagePlus size={22} /><span>{state.matchdaySubject ? 'Sostituisci PNG del giocatore' : 'Carica PNG del giocatore'}</span><small>Immagine già scontornata · resta nel browser</small><input type="file" accept="image/png" onChange={event => { uploadMatchdaySubject(event.target.files?.[0]); event.target.value = ''; }} /></label>
            {state.matchdaySubject && <button className="gg-remove-image" type="button" onClick={() => update('matchdaySubject', '')}>Rimuovi giocatore</button>}
            <div className="gg-grid gg-sliders">
              <label className="gg-field"><span>Posizione orizzontale · {state.matchdaySubjectX} px</span><input type="range" min="-280" max="280" step="1" value={state.matchdaySubjectX} onChange={event => update('matchdaySubjectX', Number(event.target.value))} /></label>
              <label className="gg-field"><span>Posizione verticale · {state.matchdaySubjectY} px</span><input type="range" min="-300" max="300" step="1" value={state.matchdaySubjectY} onChange={event => update('matchdaySubjectY', Number(event.target.value))} /></label>
              <label className="gg-field"><span>Dimensione giocatore · {Math.round(state.matchdaySubjectZoom * 100)}%</span><input type="range" min="0.5" max="2" step="0.05" value={state.matchdaySubjectZoom} onChange={event => update('matchdaySubjectZoom', Number(event.target.value))} /></label>
            </div>
          </section>
        </> : <>
          {state.type === 'risultato' && <section className="gg-panel"><div className="gg-panel-head"><span>01</span><h3>Partita</h3></div><div className="gg-grid"><Select label="Prendi dal calendario" value={selectedGame} onChange={pickGame} options={[{ value: '', label: 'Seleziona una partita' }, ...games.map(game => ({ value: game.id, label: `${game.date} · ${game.home} – ${game.away}` }))]} /><Field label="Squadra di casa" value={state.homeTeam} onChange={value => updateTeam('home', value)} /><Field label="Squadra ospite" value={state.awayTeam} onChange={value => updateTeam('away', value)} /><Select label="Logo casa" value={state.homeLogo} onChange={value => update('homeLogo', value)} options={[{ value: '', label: 'Nessuno' }, ...logoOptions]} /><Select label="Logo ospite" value={state.awayLogo} onChange={value => update('awayLogo', value)} options={[{ value: '', label: 'Nessuno' }, ...logoOptions]} /><Select label="Squadra Nerone (numero pieno)" value={state.resultClubSide} onChange={value => update('resultClubSide', value as GraphicState['resultClubSide'])} options={[{ value: 'home', label: 'In casa' }, { value: 'away', label: 'In trasferta' }, { value: 'none', label: 'Nessuna delle due' }]} /></div></section>}
          {state.type === 'risultato' && <section className="gg-panel"><div className="gg-panel-head"><span>02</span><h3>Contenuti</h3></div><p className="gg-help">Loghi mono bianchi disponibili: Nerone, Nerone BGV e Ciampino. Per altre squadre aggiungi il relativo PNG in assets/teams/2026-27/mono_white.</p><div className="gg-grid"><Field label="Campionato e giornata" value={state.competition} onChange={value => update('competition', value)} /><Field label="Punti casa" value={state.homeScore} onChange={value => update('homeScore', value.replace(/\D/g, '').slice(0, 3))} /><Field label="Punti ospite" value={state.awayScore} onChange={value => update('awayScore', value.replace(/\D/g, '').slice(0, 3))} /></div></section>}
          <section className="gg-panel"><div className="gg-panel-head"><span>{state.type === 'week' ? '02' : '03'}</span><h3>Immagine</h3></div><label className="gg-upload"><ImagePlus size={22} /><span>{state.photo ? 'Sostituisci immagine' : 'Carica immagine di sfondo'}</span><small>JPG, PNG o WebP · resta nel browser</small><input type="file" accept="image/*" onChange={event => uploadPhoto(event.target.files?.[0])} /></label><div className="gg-grid gg-sliders"><label className="gg-field"><span>Spostamento orizzontale</span><input type="range" min="-100" max="100" value={state.photoX} onChange={event => update('photoX', Number(event.target.value))} /></label><label className="gg-field"><span>Spostamento verticale</span><input type="range" min="-100" max="100" value={state.photoY} onChange={event => update('photoY', Number(event.target.value))} /></label><label className="gg-field"><span>Zoom · {Math.round(state.photoZoom * 100)}%</span><input type="range" min="1" max="2" step="0.05" value={state.photoZoom} onChange={event => update('photoZoom', Number(event.target.value))} /></label>{state.type === 'week' && <label className="gg-field"><span>Sfocatura sfondo · {state.backgroundBlur} px</span><input type="range" min="0" max="12" step="1" value={state.backgroundBlur} onChange={event => update('backgroundBlur', Number(event.target.value))} /></label>}</div></section>
        </>}

        {state.type === 'week' && <section className="gg-panel"><div className="gg-panel-head"><span>03</span><h3>Soggetto in primo piano</h3></div><p className="gg-help">Carica un PNG del soggetto già scontornato per disporre i GLASS davanti o dietro di lui.</p><div className="gg-actions"><label className="gg-csv-upload">Carica PNG trasparente<input type="file" accept="image/png" onChange={event => { uploadSubject(event.target.files?.[0]); event.target.value = ''; }} /></label>{state.subjectPhoto && <button type="button" onClick={() => update('subjectPhoto', '')}>Rimuovi soggetto</button>}</div><p className="gg-local-note">Il PNG deve avere la stessa dimensione della foto originale, così i due livelli restano allineati.</p></section>}

        {state.type === 'week' && <section className="gg-panel">
          <div className="gg-panel-head"><span>04</span><h3>Partite e glass</h3></div>
          <p className="gg-help">Ogni glass partita contiene un incontro diverso. Il glass sponsor si adatta ai pixel visibili del logo con un margine di 24 px. Trascina i glass sull’anteprima anche con il dito.</p>
          {state.glasses.map((glass, index) => <div className="gg-appointment" key={glass.id}>
            <div className="gg-row-title"><strong>Glass {index + 1} · {glass.kind === 'sponsor' ? 'Sponsor' : `${glass.match.homeTeam || 'Casa'} – ${glass.match.awayTeam || 'Ospite'}`}</strong><button type="button" aria-label={`Elimina glass ${index + 1}`} onClick={() => setState(current => ({ ...current, glasses: current.glasses.filter(item => item.id !== glass.id) }))}><Trash2 size={17} /></button></div>
            <div className="gg-grid">
              <Select label="Livello del glass" value={glass.layer} onChange={value => updateGlass(glass.id, { layer: value as Glass['layer'] })} options={[{ value: 'behind', label: 'Dietro il soggetto' }, { value: 'front', label: 'Davanti al soggetto' }]} />
              {glass.kind === 'sponsor' ? <Select label="Logo sponsor" value={glass.sponsorId} onChange={value => changeGlassSponsor(glass.id, value)} options={sponsorOptions} /> : <>
              <Select label="Partita dal calendario" value={glass.match.gameId} onChange={value => pickWeekGame(glass.id, value)} options={[{ value: '', label: 'Compila manualmente' }, ...games.filter(game => !state.glasses.some(item => item.id !== glass.id && item.kind === 'match' && item.match.gameId === game.id)).map(game => ({ value: game.id, label: `${game.date} · ${game.home} – ${game.away}` }))]} />
              <Field label="Titolo" value={glass.match.title} onChange={value => updateGlassMatch(glass.id, { title: value })} />
              <Field label="Squadra di casa" value={glass.match.homeTeam} onChange={value => updateGlassMatch(glass.id, { homeTeam: value })} />
              <Field label="Squadra ospite" value={glass.match.awayTeam} onChange={value => updateGlassMatch(glass.id, { awayTeam: value })} />
              <Select label="Logo casa" value={glass.match.homeLogo} onChange={value => updateGlassMatch(glass.id, { homeLogo: value })} options={[{ value: '', label: 'Nessuno' }, ...logoOptions]} />
              <Select label="Logo ospite" value={glass.match.awayLogo} onChange={value => updateGlassMatch(glass.id, { awayLogo: value })} options={[{ value: '', label: 'Nessuno' }, ...logoOptions]} />
              <Field label="Campionato e giornata" value={glass.match.competition} onChange={value => updateGlassMatch(glass.id, { competition: value })} />
              <Field label="Data e ora" value={glass.match.dateTime} onChange={value => updateGlassMatch(glass.id, { dateTime: value })} />
              <Field label="Indirizzo" value={glass.match.address} onChange={value => updateGlassMatch(glass.id, { address: value })} />
              </>}
            </div>
            <div className="gg-grid gg-sliders">{(['x', 'y', 'width', 'height'] as const).map(key => <label className="gg-field" key={key}><span>{key === 'x' ? 'X' : key === 'y' ? 'Y' : key === 'width' ? 'Larghezza' : 'Altezza'} · {glass[key]} px</span><input type="range" min={key === 'width' ? (glass.kind === 'sponsor' ? 120 : 280) : key === 'height' ? (glass.kind === 'sponsor' ? 80 : 380) : 0} max={key === 'x' ? 1080 - glass.width : key === 'y' ? canvasHeight - glass.height : key === 'width' ? (glass.kind === 'sponsor' ? 800 : 660) : (glass.kind === 'sponsor' ? 400 : 680)} step="1" value={glass[key]} onChange={event => updateGlass(glass.id, { [key]: Number(event.target.value) })} /></label>)}</div>
          </div>)}
          <button className="gg-add" type="button" onClick={addGlass}><Plus size={17} /> Aggiungi glass</button>
        </section>}

        {state.type !== 'week' && <section className="gg-panel"><div className="gg-panel-head"><span>{state.type === 'calendario' ? '03' : '04'}</span><h3>Sponsor</h3></div><Select label="Logo sponsor" value={state.sponsor} onChange={value => update('sponsor', value)} options={sponsorOptions} /></section>}
        </Fragment>
        <p className="gg-local-note">Il lavoro resta in questa scheda: scarica il PNG prima di chiuderla.</p>
      </div>
      <aside className="gg-preview"><div className="gg-preview-head"><div><p className="gg-eyebrow">ANTEPRIMA LIVE</p><h2>{TYPE_LABELS[state.type]}</h2></div><span>1080 × {canvasHeight} px</span></div><div className="gg-canvas-wrap"><canvas ref={canvasRef} width="1080" height={canvasHeight} aria-label={`Anteprima ${TYPE_LABELS[state.type]}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} style={{ aspectRatio: `1080 / ${canvasHeight}`, touchAction: state.type === 'week' ? 'none' : 'auto' }} /></div>{message && <p className="gg-message" role="status">{message}</p>}<button className="gg-download" type="button" disabled={!ready} onClick={downloadPng}><ArrowDownToLine size={19} /> Scarica PNG</button><p className="gg-preview-note">{state.type === 'week' && state.weekFormat === 'story' ? 'Storia Instagram' : 'Post Instagram'} · esportazione alla risoluzione originale.</p></aside>
    </div>
  </main>;
}
