import "./App.css";
import { Routes, Route } from "react-router-dom";
import { GenerateStories } from "../GenerateStories/GenerateStories";
import { Header } from "../Header/Header";
import { StoryList } from "../StoryList/StoryList";
import { SingleStory } from "../SingleStory/SingleStory";

function App() {
  return (
    <div className="App">
    <Header />
      <Routes>
        <Route path="/" element={<GenerateStories />} />
        <Route path="/selaa-tarinoita" element={<StoryList />} />
        <Route path="/selaa-tarinoita/:id" element={<SingleStory />} />
      </Routes>
    </div>
  );
}

export default App;
