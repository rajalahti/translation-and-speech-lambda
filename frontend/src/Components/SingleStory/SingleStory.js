import React, { useState, useEffect } from "react";
import { CircularProgress, Button, Box } from "@mui/material";
import { getAudioUrl, getStoryById } from "../../Utils/Api/Api";
import { Player } from "react-simple-player";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { StoryDisplay } from "../StoryDisplay/StoryDisplay";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useParams } from "react-router-dom";
import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const SingleStory = () => {
  const [story, setStory] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [storyId, setStoryId] = useState("");
  const [audio, setAudio] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");

  const { id } = useParams();

  // Fetch a story with the given id
  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      const storyData = await getStoryById(id);
      if (storyData && storyData.storyFi) {
        setStory(storyData.storyFi);
        setPrompt(storyData.promptFi);
        setStoryId(storyData.id);
        if (storyData.audio) {
          setAudio(storyData.audio);
        }
        setLoading(false);
      } else {
        handleErrorOpen("Virhe haettaessa tarinaa");
        setLoading(false);
      }
    };
    fetchStory();
  }, [id]);

  // This function gets the audio url for the story
  const handleAudioUrlFetch = async () => {
    setAudioLoading(true);
    // If storyId or story is empty, return
    if (storyId === "" || story === "") return;
    // Filter out empty items from the story array
    let filteredStory = story.filter((item) => item !== "");
    // Join the story array into a string
    let joinedStory = filteredStory.join(".");
    console.log(joinedStory);
    // Get the audio url
    const audioUrl = await getAudioUrl(joinedStory, storyId);
    setAudio(audioUrl);
    setAudioLoading(false);
  };

  const handleErrorOpen = (message) => {
    setError(true);
    setErrorText(message);
  };

  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setError(false);
    setErrorText("");
  };

  const Alert = React.forwardRef((props, ref) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  return (
    <Box sx={{ maxWidth: 1000, margin: "50px auto", textAlign: 'left' }}>
      {/* Navigation and audio controls row */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mx: 4, 
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        {/* Back button */}
        <Link
          component={RouterLink}
          to="/selaa-tarinoita"
          underline="none"
          sx={{ 
            fontSize: 16, 
            fontWeight: 700, 
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowBackIcon sx={{ marginRight: 1 }} /> Takaisin
        </Link>
        
        {/* Audio player or button */}
        {audioLoading ? (
          <CircularProgress size={30} sx={{ color: '#7c4c16' }} />
        ) : audio ? (
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            borderRadius: '4px', 
            padding: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minWidth: { xs: '100%', sm: 'auto' }
          }}>
            <Player src={audio} autoPlay={false} grey={[22, 22, 22]} height={40} />
          </Box>
        ) : story.length > 0 ? (
          <Button
            variant="contained"
            onClick={handleAudioUrlFetch}
            startIcon={<VolumeUpIcon />}
            sx={{ 
              backgroundColor: '#7c4c16',
              '&:hover': {
                backgroundColor: '#5e3a10',
              },
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Kuuntele
          </Button>
        ) : null}
      </Box>

      {loading ? <CircularProgress sx={{ m: 4 }} /> : ""}
      <Snackbar open={error} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert
          onClose={handleErrorClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorText}
        </Alert>
      </Snackbar>
      {story.length > 0 ? (
        <StoryDisplay 
          story={story} 
          prompt={prompt}
        /> 
      ) : ""}
    </Box>
  );
};
