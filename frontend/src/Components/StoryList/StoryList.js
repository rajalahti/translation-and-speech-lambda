import React, { useState, useEffect } from "react";
import { StoryCard } from "../StoryCard/StoryCard";
import ButtonGroup from "../InputComponents/ButtonGroup";
import { getStories } from "../../Utils/Api/Api";
import { Box } from "@mui/system";

export const StoryList = () => {
  const [stories, setStories] = useState([]);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [currentEvaluatedKey, setCurrentEvaluatedKey] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      const data = await getStories(lastEvaluatedKey);
      console.log(data);
      setStories(data.translations);
      let key = JSON.parse(data.lastEvaluatedKey);
      key = key.id;
      console.log(key)
      setCurrentEvaluatedKey(key);
    };
    fetchStories();
  }, [lastEvaluatedKey]);

  const handleLoadMore = () => {
    setLastEvaluatedKey(currentEvaluatedKey);
  };

  return (
    <div>
      <ButtonGroup />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'space-evenly'}}>
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </Box>
      <button onClick={handleLoadMore}>Load more</button>
    </div>
  );
};
