/*  
    This component is used to generate stories for the user.
    It is used in the App.
    It uses the MUI components Typography, Button, TextField, Box
    It uses the  functions GenerateStories, getAudio, translate from Api.js
*/
import React, { useState, useEffect } from "react";
import { Typography, Button, TextField, Box } from "@mui/material";
import { generateStory, getAudio, translate } from "../../Utils/Api/Api";

export const GenerateStories = () => {
  const [story, setStory] = useState([]);
  const [audio, setAudio] = useState("");
  const [prompt, setPrompt] = useState("");

  // This function translates the prompt and generates the story
  const handleStoryGeneration = async () => {
    // If propt is empty, return
    if (prompt === "") return;
    // Translate the prompt
    const translatedPrompt = await translate(prompt, 'EN', false);
    console.log(translatedPrompt);
    const story = await generateStory(translatedPrompt);
    console.log(story)
    let translatedStory = await translate(story, 'FI', true);
    console.log(translatedStory);
    // Split the story into an array of paragraphs using | as a delimiter
    setStory(translatedStory);
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '80px auto' }}>
      <Box
        sx={{ mx: 3, marginBottom: 2, display: "flex", flexDirection: "row", gap: 2, justifyContent: "center", alignItems:"stretch" }}
      >
        <TextField
          id="outlined-basic"
          label="Mistä haluat kuulla tarinan?"
          placeholder="Joulupukista, joka vaihtoi poronsa alligaattoreihin ja muutti Egyptiin"
          variant="outlined"
          onChange={(e) => setPrompt(e.target.value)}
          sx={{ flexGrow: 2}}
        />
        <Button
          variant="contained"
          onClick={handleStoryGeneration}
        >
          Luo tarina
        </Button>
      </Box>
      <Box sx={{my: 10, mx: 3, background: '#1E1B1B', py:5, border: '3px solid #7E6C5E', borderRadius: 4}}>
        {Array.isArray(story) && story.map((paragraph, index) => (
        <Typography key={index} variant="body" sx={{ mb: 2, color: '#CAB09C', fontSize: '1.25rem', display: 'block', textAlign: 'left', px:3, lineHeight:1.125 }}>
          { paragraph }
        </Typography>
        ))}
      </Box>
    </Box>
  );
};
