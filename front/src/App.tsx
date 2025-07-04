import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IntroMain from "./components/Intro/IntroMain";
import OpinionMain from "./components/Opinion/OpinionMain";
import InfoMain from "./components/Info/InfoMain";
import "./App.css";

function App() {
  return (
    <div className="app-scale-67">
      <Router>
        <Routes>
          <Route path="/" element={<IntroMain />} />
          <Route path="/opinion" element={<OpinionMain />} />
          <Route path="/info" element={<InfoMain />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
