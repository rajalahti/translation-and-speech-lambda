import React, { useState, useEffect } from "react";
import { StoryCard } from "../StoryCard/StoryCard";
import ButtonGroup from "../InputComponents/ButtonGroup";
import { getStories } from "../../Utils/Api/Api";
import { Box } from "@mui/system";
import InfiniteScroll from "react-infinite-scroller";
import Grid from "@mui/material/Grid";


export const StoryList = () => {
  const [stories, setStories] = useState([]);
  const [lastEvaluatedKey, setLastEvaluetedKey] = useState(null);
  const [storyType, setStoryType] = useState("all");

  useEffect(() => {
    const fetchStories = async () => {
      // if storyType is all then we don't need to pass it to the api
      const storyTypeParam = storyType === "all" ? null : storyType;
      const data = await getStories(lastEvaluatedKey, storyTypeParam);
      // Filter out stories that do not have storyFi field
      const filteredData = data.translations.filter(story => story.storyFi !== 'undefined')
      setStories([...stories, ...filteredData]);
      setStories(data.translations);
      let key = JSON.parse(data.lastEvaluatedKey);
      key = key.id;
      setLastEvaluetedKey(key);
    };
    fetchStories();
  }, [storyType]);

  const handleLoadMore = () => {
    const fetchStories = async () => {
      // if storyType is all then we don't need to pass it to the api
      const storyTypeParam = storyType === "all" ? null : storyType;
      const data = await getStories(lastEvaluatedKey, storyTypeParam);
      // Filter out stories that do not have storyFi field
      const filteredData = data.translations.filter(story => story.storyFi !== 'undefined')
      setStories([...stories, ...filteredData]);
      let key = data.lastEvaluatedKey
        ? JSON.parse(data.lastEvaluatedKey)
        : null;
      key = key && key.id;
      setLastEvaluetedKey(key);
    };
    fetchStories();
  };

  return (
    <Box sx={{ my: 5, width: "100%" }}>
      <ButtonGroup storyType={storyType} setStoryType={setStoryType} variant="filter" setLastEvaluetedKey={setLastEvaluetedKey}  />

      <InfiniteScroll
        pageStart={0}
        loadMore={handleLoadMore}
        hasMore={lastEvaluatedKey !== null}
        style={{paddingTop: '50px'}}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        <Grid container spacing={3} align="center" sx={{overflow: 'auto'}}>
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
