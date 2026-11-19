import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Container,
  type SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import api from '../services/api';
import EventCard from '../components/EventCard';
import type { Event, Venue } from '../types';

const CATEGORIES = ['Recital', 'Freestyle', 'Teatro', 'Stand-Up'] as const;

export default function HomePage() {
  const [events,   setEvents]   = useState<Event[]>([]);
  const [venues,   setVenues]   = useState<Venue[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [venueId,  setVenueId]  = useState('');
  const [nearLoading, setNearLoading] = useState(false);

  const fetchEvents = useCallback(
    async (params: Record<string, string> = {}) => {
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
    },
    [],
  );

  useEffect(() => {
    void api.get<Venue[]>('/api/venues').then(({ data }) => setVenues(data)).catch(() => null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params: Record<string, string> = {};
      if (search.trim()) params['search'] = search.trim();
      if (category)      params['category'] = category;
      if (venueId)       params['venue']    = venueId;
      void fetchEvents(params);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, category, venueId, fetchEvents]);

  const handleCategoryChange = (e: SelectChangeEvent) => setCategory(e.target.value);
  const handleVenueChange    = (e: SelectChangeEvent) => setVenueId(e.target.value);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }
    setNearLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await api.get<Venue[]>('/api/venues', {
            params: { lng: coords.longitude, lat: coords.latitude, maxDistance: 10000 },
          });
          if (data.length === 0) {
            setError('No hay venues cercanos en un radio de 10 km.');
            setEvents([]);
          } else {
            const nearIds = data.map((v) => v._id).join(',');
            const { data: evs } = await api.get<Event[]>('/api/events');
            setEvents(evs.filter((e) => nearIds.includes(typeof e.venue === 'object' ? e.venue._id : e.venue)));
          }
        } catch {
          setError('Error al obtener venues cercanos.');
        } finally {
          setNearLoading(false);
        }
      },
      () => {
        setError('No se pudo obtener tu ubicación.');
        setNearLoading(false);
      },
    );
  };

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, width: '100%' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🎟 Próximos eventos
      </Typography>

      {/* Filtros */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
          alignItems: 'center',
        }}
      >
        <TextField
          label="Buscar artista o evento"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 260, flexGrow: { xs: 1, sm: 0 } }}
        />

        <FormControl size="small" sx={{ minWidth: 160, flexGrow: { xs: 1, sm: 0 } }}>
          <InputLabel>Categoría</InputLabel>
          <Select value={category} label="Categoría" onChange={handleCategoryChange}>
            <MenuItem value="">Todas</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200, flexGrow: { xs: 1, sm: 0 } }}>
          <InputLabel>Venue</InputLabel>
          <Select value={venueId} label="Venue" onChange={handleVenueChange}>
            <MenuItem value="">Todos</MenuItem>
            {venues.map((v) => (
              <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<MyLocationIcon />}
          onClick={handleNearMe}
          disabled={nearLoading}
        >
          {nearLoading ? 'Buscando…' : 'Cerca mío'}
        </Button>

        {(search || category || venueId) && (
          <Button
            variant="text"
            onClick={() => {
              setSearch('');
              setCategory('');
              setVenueId('');
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={56} />
        </Box>
      ) : events.length === 0 ? (
        <Alert severity="info">No hay eventos que coincidan con los filtros.</Alert>
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
