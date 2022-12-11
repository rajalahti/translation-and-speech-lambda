import "./App.css";
import { Routes, Route } from "react-router-dom";
import { GenerateStories } from "../GenerateStories/GenerateStories";
import { Header } from "../Header/Header";

function App() {
  return (
    <div className="App">
    <Header />
      <Routes>
        <Route path="/" element={<GenerateStories />} />
      </Routes>
    </div>
  );
}

export default App;
