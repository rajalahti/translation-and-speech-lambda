import React from "react";
import { Typography, Box, Paper, IconButton, Fade } from "@mui/material";
import { Player } from "react-simple-player";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

export const StoryDisplay = ({ story, prompt, audio, onAudioRequest, audioLoading }) => {
  // Moving the audio player outside of the paper component
  // The parent component will handle rendering it at the top level
  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        background: 'linear-gradient(to right, rgba(242, 238, 232, 0.95), rgba(242, 238, 232, 0.9)), url("/images/fantasy.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: '40px 25px 50px 25px',
        margin: '20px 20px',
        borderRadius: '8px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.15), inset 0 0 80px rgba(248, 240, 227, 0.5)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/png;base64,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")',
          opacity: 0.3,
          pointerEvents: 'none'
        }
      }}
    >
      {/* Story title */}
      <Typography
        variant="h2"
        sx={{
          mb: 3,
          display: "block",
          textAlign: "center",
          px: { xs: 2, md: 4 },
          fontWeight: 500,
          fontSize: { xs: '1.7rem', md: '2.2rem' },
          lineHeight: "36pt",
          color: "#2d2a25",
          letterSpacing: "1px",
          wordSpacing: "3px",
          fontFamily: "'Georgia', serif",
          textShadow: "0.5px 0.5px 1px rgba(139, 69, 19, 0.4)",
          position: 'relative'
        }}
      >
        {prompt}
      </Typography>

      {/* Story content with decorative first letter */}
      {Array.isArray(story) && story.map((paragraph, index) => (
        <Typography
          key={index}
          variant="body1"
          sx={{
            mb: 2.5,
            fontSize: { xs: "1.1rem", md: "1.25rem" },
            display: "block",
            textAlign: "left",
            px: { xs: 2, md: 4 },
            fontWeight: 400,
            lineHeight: "28pt",
            color: "#2d2a25",
            letterSpacing: "0.7px",
            wordSpacing: "2px",
            fontFamily: "'Georgia', serif",
            textShadow: "0.3px 0.3px 1px rgba(139, 69, 19, 0.2)",
            '& .first-letter': {
              float: 'left',
              fontSize: '3.5rem',
              lineHeight: '3.5rem',
              paddingRight: '8px',
              paddingTop: '4px',
              fontFamily: "'Georgia', serif",
              color: '#7c4c16',
              textShadow: '0.5px 0.5px 1px rgba(139, 69, 19, 0.5)'
            }
          }}
        >
          {index === 0 ? (
            <>
              <span className="first-letter">{paragraph.charAt(0)}</span>
              {paragraph.substring(1)}
            </>
          ) : paragraph}
        </Typography>
      ))}
    </Paper>
  );
};
