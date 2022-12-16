import React from "react";
import { Typography, Box } from "@mui/material";

export const StoryDisplay = ({ story }) => {
  return (
    <Box
      sx={{
        background: 'url("https://i.imgur.com/0kjMcUe.png")',
        backgroundSize: "cover",
        backgroundPosition: "center right",
        padding: '40px 20px 85px 20px',
        margin: '0 20px',
        filter: 'brightness(0.95) sepia(30%) saturate(80%)',
        borderRadius: '30px',
        clipPath: `polygon(
          0% 0%,
          0% 93%,
          5% 98%,
          6% 99%,
          8% 95%,
          12% 94%,
          15% 97%,
          17% 93%,
          20% 98%,
          22% 97%,
          25% 99%,
          31% 94%,
          35% 93%,
          39% 96%,
          43% 93%,
          45% 94%,
          47% 95%,
          50% 92%,
          52% 96%,
          54% 93%,
          58% 92%,
          60% 95%,
          62% 93%,
          65% 96%,
          69% 93%,
          72% 93%,
          75% 94%,
          79% 97%,
          81% 94%,
          85% 93%,
          88% 92%,
          90% 95%,
          93% 93%,
          95% 92%,
          97% 95%,
          100% 97%,
          100% 0%
        )`
      }}
    >
      {Array.isArray(story) &&
        story.map((paragraph, index) => (
          <Typography
            key={index}
            variant="body"
            sx={{
              mb: 2,
              fontSize: "1.25rem",
              display: "block",
              textAlign: "left",
              px: 3,
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
