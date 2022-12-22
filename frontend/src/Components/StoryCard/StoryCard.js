import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

// Function to limit the length of the story to max 200 characters. But dont cut the words in half.
const limitStoryLength = (story) => {
  let joinedStory = story.join(" | ");
  joinedStory = joinedStory.split(" ");
  let limitedStory = [];
  while (limitedStory.join(" ").length < 200) {
    limitedStory.push(joinedStory.shift());
  }
  return limitedStory.join(" ") + "...";
};

// Random integer between 1 and 4
const randomImage = () => {
  return Math.floor(Math.random() * 4) + 1;
};

// Use images from public/images folder
export const StoryCard = ({ story }) => {
  console.log(typeof story);
  let { promptFi, storyType, storyFi } = story;
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        height="140"
        image={`images/${storyType}-story-${randomImage()}.png`}
        alt={`${storyType} image`}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {promptFi}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Array.isArray(storyFi) && limitStoryLength(storyFi)}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
};
