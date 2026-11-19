import { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Button, Grid, CircularProgress,
  Alert, Box, type SelectChangeEvent,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import api from '../services/api';
import EventCard from '../components/EventCard';
import type { Event, Venue } from '../types';

const CATEGORIES = ['Recital', 'Freestyle', 'Teatro', 'Stand-Up'] as const;

export default function EventsPage() {
  const [events,   setEvents]   = useState<Event[]>([]);
  const [venues,   setVenues]   = useState<Venue[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [venueId,  setVenueId]  = useState('');
  const [nearLoading, setNearLoading] = useState(false);

  const fetchEvents = useCallback(async (params: Record<string, string> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Event[]>('/api/events', { params });
      setEvents(data);
    } catch {
      setError('No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void api.get<Venue[]>('/api/venues').then(({ data }) => setVenues(data)).catch(() => null);
    void fetchEvents();
  }, [fetchEvents]);

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (search)   params['search']   = search;
    if (category) params['category'] = category;
    if (venueId)  params['venue']    = venueId;
    void fetchEvents(params);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) { setError('Tu navegador no soporta geolocalización.'); return; }
    setNearLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await api.get<Venue[]>('/api/venues', {
            params: { lng: coords.longitude, lat: coords.latitude, maxDistance: 10000 },
          });
          const { data: evs } = await api.get<Event[]>('/api/events');
          const nearIds = data.map((v) => v._id);
          setEvents(evs.filter((e) => nearIds.includes(typeof e.venue === 'object' ? e.venue._id : e.venue)));
        } catch { setError('Error al obtener venues cercanos.'); }
        finally  { setNearLoading(false); }
      },
      () => { setError('No se pudo obtener tu ubicación.'); setNearLoading(false); },
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Todos los eventos</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, alignItems: 'center' }}>
        <TextField label="Buscar" value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()} size="small" sx={{ minWidth: 220 }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Categoría</InputLabel>
          <Select value={category} label="Categoría" onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Venue</InputLabel>
          <Select value={venueId} label="Venue" onChange={(e: SelectChangeEvent) => setVenueId(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {venues.map((v) => <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch} disabled={loading}>Buscar</Button>
        <Button variant="outlined" startIcon={<MyLocationIcon />} onClick={handleNearMe} disabled={nearLoading}>
          {nearLoading ? 'Buscando…' : 'Cerca mío'}
        </Button>
        {(search || category || venueId) && (
          <Button variant="text" onClick={() => { setSearch(''); setCategory(''); setVenueId(''); void fetchEvents(); }}>
            Limpiar
          </Button>
        )}
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={56} /></Box>
      ) : events.length === 0 ? (
        <Alert severity="info">No hay eventos que coincidan.</Alert>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid key={event._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
