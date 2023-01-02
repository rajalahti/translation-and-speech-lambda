import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

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

// Use images from public/images folder
export const StoryCard = ({ story }) => {
  let { promptFi, storyType, storyFi, image, id } = story;
  return (
    <Card sx={{ maxWidth: 345, height: "100%", position: "relative" }}>
      <CardMedia
        component="img"
        height="140"
        image={image}
        alt={`${storyType} image`}
      />
      <CardContent sx={{ mb: "35px" }}>
        <Typography gutterBottom variant="h5" component="div">
          {promptFi && limitStoryLength(promptFi, 70)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Array.isArray(storyFi) && limitStoryLength(storyFi, 200)}
        </Typography>
      </CardContent>
      <CardActions sx={{ position: "absolute", bottom: 0 }}>
        <Link
          component={RouterLink}
          to={`/selaa-tarinoita/${id}`}
          underline="none"
          sx={{ fontSize: 16, fontWeight: 700, mx: 1, mb: 1 }}
        >
          Lue tarina
        </Link>
      </CardActions>
    </Card>
  );
};
