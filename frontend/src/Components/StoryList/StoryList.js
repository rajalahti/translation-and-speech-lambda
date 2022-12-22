import React, { useState, useEffect, useRef } from "react";
import { StoryCard } from "../StoryCard/StoryCard";
import ButtonGroup from "../InputComponents/ButtonGroup";
import { getStories } from "../../Utils/Api/Api";
import { Box } from "@mui/system";
import InfiniteScroll from 'react-infinite-scroller';

export const StoryList = () => {
  const [stories, setStories] = useState([]);
  const [nextKey, setNextKey] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      const data = await getStories(nextKey);
      console.log(data);
      setStories(data.translations);
      let key = JSON.parse(data.lastEvaluatedKey);
      console.log(key)
      key = key.id;
      console.log(key)
      setNextKey(key)
    };
    fetchStories();
  }, []);

  const handleLoadMore = () => {
    const fetchStories = async () => {
      const data = await getStories(nextKey);
      setStories([...stories, ...data.translations]);
      let key = data.lastEvaluatedKey ? JSON.parse(data.lastEvaluatedKey) : null;
      key = key && key.id;
      console.log(key)
      setNextKey(key)
    };
    fetchStories();
    
  };

  return (
    <Box sx={{my: 5}}>
      <ButtonGroup />
      <InfiniteScroll
            pageStart={0}
            loadMore={handleLoadMore}
            hasMore={nextKey !== null}
            loader={<div className="loader" key={0}>Loading ...</div>}
            style={{display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-evenly', marginTop: '2rem'}}
        >
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
        </InfiniteScroll>
    </Box>
  );
};
