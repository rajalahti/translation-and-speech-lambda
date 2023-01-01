import React, { useState, useEffect } from "react";
import { StoryCard } from "../StoryCard/StoryCard";
import ButtonGroup from "../InputComponents/ButtonGroup";
import { getStories } from "../../Utils/Api/Api";
import { Box } from "@mui/system";
import InfiniteScroll from "react-infinite-scroller";
import Grid from "@mui/material/Grid";

export const StoryList = () => {
  const [stories, setStories] = useState([]);
  const [nextKey, setNextKey] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      const data = await getStories(nextKey);
      setStories(data.translations);
      let key = JSON.parse(data.lastEvaluatedKey);
      key = key.id;
      setNextKey(key);
    };
    fetchStories();
  }, []);

  const handleLoadMore = () => {
    const fetchStories = async () => {
      const data = await getStories(nextKey);
      setStories([...stories, ...data.translations]);
      let key = data.lastEvaluatedKey
        ? JSON.parse(data.lastEvaluatedKey)
        : null;
      key = key && key.id;
      setNextKey(key);
    };
    fetchStories();
  };

  return (
    <Box sx={{ my: 5, width: "100%" }}>
      <ButtonGroup />

      <InfiniteScroll
        pageStart={0}
        loadMore={handleLoadMore}
        hasMore={nextKey !== null}
        style={{paddingTop: '50px'}}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        <Grid container spacing={3} align="center">
          {stories.map((story, index) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={index} >
              <StoryCard key={story.id} story={story} />
            </Grid>
          ))}
        </Grid>
      </InfiniteScroll>
    </Box>
  );
};
