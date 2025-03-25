import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, Chip, Link, Paper } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import BookIcon from '@mui/icons-material/Book';

// Function to limit the length of the story to max n characters. But dont cut the words in half.
const limitStoryLength = (story, charLimit) => {
  let joinedStory = story;
  if (Array.isArray(story)) {
    joinedStory = story.join(" | ");
  }
  joinedStory = joinedStory.split(" ");
  let limitedStory = [];
  while (limitedStory.join(" ").length < charLimit) {
    limitedStory.push(joinedStory.shift());
  }
  let finalStory = limitedStory.join(" ");
  if (finalStory.length < joinedStory.join(" ").length) {
    finalStory += "...";
  }
  return finalStory;
};

export const StoryCard = ({ story }) => {
  let { promptFi, storyType, storyFi, image, id, timestamp } = story;
  
  // Format the date if it exists - timestamp is stored as a string of milliseconds since epoch
  const formattedDate = timestamp 
    ? format(new Date(parseInt(timestamp)), "d. MMMM yyyy", { locale: fi }) 
    : "Päiväys tuntematon";
    
  // Map story types to Finnish
  const getStoryTypeInFinnish = (type) => {
    const storyTypeMap = {
      "childrens": "Satu",
      "fantasy": "Fantasia",
      "adventure": "Seikkailu",
      "nonfiction": "Tositarina",
      "thriller": "Jännitys",
      "horror": "Kauhu"
    };
    return storyTypeMap[type?.toLowerCase()] || type;
  };
  
  const storyTypeInFinnish = getStoryTypeInFinnish(storyType);
  
  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: "100%", 
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
        borderRadius: 2,
        overflow: 'hidden',
      }}
      elevation={3}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={image}
          alt={`${storyTypeInFinnish} image`}
          sx={{ 
            objectFit: 'cover',
          }}
        />
        <Chip 
          label={storyTypeInFinnish} 
          size="small"
          color="secondary"
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }} 
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2.5 }}>
        <Typography 
          gutterBottom 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 1.5
          }}
        >
          {promptFi && limitStoryLength(promptFi, 70)}
        </Typography>
        
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 1.5, 
            bgcolor: 'rgba(0,0,0,0.02)', 
            borderRadius: 1,
            flexGrow: 1,
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {Array.isArray(storyFi) && limitStoryLength(storyFi, 200)}
          </Typography>
        </Paper>
        
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}
        >
          Luotu: {formattedDate}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Link
          component={RouterLink}
          to={`/selaa-tarinoita/${id}`}
          underline="none"
          sx={{ 
            fontSize: 16, 
            fontWeight: 700, 
            py: 1.25,
            px: 2.5,
            borderRadius: 1.5,
            bgcolor: 'primary.dark',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            transition: 'all 0.2s',
            boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'primary.main',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              textDecoration: 'none'
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 2px 3px rgba(0,0,0,0.2)'
            }
          }}
        >
          <BookIcon fontSize="small" />
          Lue tarina
        </Link>
      </CardActions>
    </Card>
  );
};
