import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../types';

interface Props {
  event: Event;
}

const CATEGORY_COLOR: Record<string, 'primary' | 'secondary' | 'success' | 'warning'> = {
  Recital:   'primary',
  Freestyle: 'secondary',
  Teatro:    'success',
  'Stand-Up': 'warning',
};

export default function EventCard({ event }: Props) {
  const navigate  = useNavigate();
  const minPrice  = Math.min(...event.sectors.map((s) => s.price));
  const funciones = event.dates.length;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={event.imageUrl}
        alt={event.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Chip
            label={event.category}
            color={CATEGORY_COLOR[event.category] ?? 'default'}
            size="small"
          />
          <Chip
            label={funciones === 1 ? '1 función' : `${funciones} funciones`}
            variant="outlined"
            size="small"
          />
        </Box>

        <Typography variant="subtitle2" color="text.secondary" noWrap>
          {event.artist}
        </Typography>
        <Typography variant="h6" fontWeight={700} noWrap gutterBottom>
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          📍 {typeof event.venue === 'object' ? event.venue.name : '—'}
        </Typography>
        <Typography variant="body2" color="primary" fontWeight={600} sx={{ mt: 1 }}>
          Desde ${minPrice.toLocaleString('es-AR')}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          size="small"
          onClick={() => navigate(`/events/${event._id}`)}
        >
          Ver entradas
        </Button>
      </CardActions>
    </Card>
  );
}
