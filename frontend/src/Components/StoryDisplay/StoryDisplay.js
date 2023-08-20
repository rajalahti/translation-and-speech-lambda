import React from "react";
import { Typography, Box } from "@mui/material";

export const StoryDisplay = ({ story, prompt }) => {
  return (
    <Box
      sx={{
        background: 'url("https://i.imgur.com/0kjMcUe.png")',
        backgroundSize: "1000px",
        backgroundPosition: "center right",
        padding: '40px 20px 85px 20px',
        margin: '0 20px',
        filter: 'brightness(0.95) sepia(30%) saturate(80%)',
        borderRadius: '30px'
      }}
    >
      <Typography
            variant="h2"
            sx={{
              mb: 2,
              display: "block",
              textAlign: "left",
              px: { sx: 1, md: 3 },
              fontWeight: 400,
              lineHeight: "32pt",
              color: "#565046",
              letterSpacing: "0.5px",
              wordSpacing: "3px",
              textShadow: "0.2px 0.2px 1.3px Sienna",
            }}
          >
            {prompt}
          </Typography>
      {Array.isArray(story) &&
        story.map((paragraph, index) => (
          <Typography
            key={index}
            variant="body"
            sx={{
              mb: 2,
              fontSize: { sx: "1.1rem", md: "1.25rem"},
              display: "block",
              textAlign: "left",
              px: { sx: 1, md: 3 },
              fontWeight: 400,
              lineHeight: "28pt",
              color: "#565046",
              letterSpacing: "0.5px",
              wordSpacing: "3px",
              textShadow: "0.2px 0.2px 1.3px Sienna",
            }}
          >
            {paragraph}
          </Typography>
        ))}
    </Box>
  );
};
