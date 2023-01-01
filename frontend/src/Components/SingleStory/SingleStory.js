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
      if (storyData !== "") {
        setStory(storyData.storyFi);
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

  // If audio is not empty and story is not empty, display Player component
  // If audio is empty and story is not empty, display Button component
  // If story is empty, display nothing
  const displayPlayer = () => {
    if (audioLoading) return <CircularProgress />;
    if (audio !== "" && story !== "") {
      return (
        <Player src={audio} autoPlay={false} grey={[22, 22, 22]} height={40} />
      );
    } else if (audio === "" && story !== "") {
      return (
        <Button
          variant="contained"
          onClick={handleAudioUrlFetch}
          startIcon={<VolumeUpIcon />}
        >
          Kuuntele
        </Button>
      );
    } else {
      return "";
    }
  };

  const Alert = React.forwardRef((props, ref) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  return (
    <Box sx={{ maxWidth: 1000, margin: "50px auto", textAlign: 'left' }}>
      <Link
        component={RouterLink}
        to="/selaa-tarinoita"
        underline="none"
        sx={{ fontSize: 16, fontWeight: 700, mx: 4, mb: 1 }}
      >
        <ArrowBackIcon sx={{position: 'relative', top: 6}} />  Takaisin
      </Link>
      <Box sx={{ my: 5, mx: 3, display: "flex", justifyContent: "start" }}>
        {displayPlayer()}
      </Box>
      {loading ? <CircularProgress /> : ""}
      <Snackbar open={error} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert
          onClose={handleErrorClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorText}
        </Alert>
      </Snackbar>
      {story ? <StoryDisplay story={story} /> : ""}
    </Box>
  );
};
