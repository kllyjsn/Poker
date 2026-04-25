import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Curriculum } from "./pages/Curriculum";
import { WeekView } from "./pages/WeekView";
import { LessonPage } from "./pages/Lesson";
import { Trainers } from "./pages/Trainers";
import { Settings } from "./pages/Settings";
import { Stats } from "./pages/Stats";
import { HandRankingTrainer } from "./pages/trainers/HandRankingTrainer";
import { PotOddsTrainer } from "./pages/trainers/PotOddsTrainer";
import { EquityTrainer } from "./pages/trainers/EquityTrainer";
import { PreflopTrainer } from "./pages/trainers/PreflopTrainer";
import { ICMTrainer } from "./pages/trainers/ICMTrainer";
import { ThreeBetTrainer } from "./pages/trainers/ThreeBetTrainer";
import { CbetTrainer } from "./pages/trainers/CbetTrainer";
import { TurnBarrelTrainer } from "./pages/trainers/TurnBarrelTrainer";
import { RiverDecisionTrainer } from "./pages/trainers/RiverDecisionTrainer";
import { PushFoldTrainer } from "./pages/trainers/PushFoldTrainer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="week/:week" element={<WeekView />} />
          <Route path="lesson/:id" element={<LessonPage />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="stats" element={<Stats />} />
          <Route path="trainers/hand-ranking" element={<HandRankingTrainer />} />
          <Route path="trainers/pot-odds" element={<PotOddsTrainer />} />
          <Route path="trainers/equity" element={<EquityTrainer />} />
          <Route path="trainers/preflop" element={<PreflopTrainer />} />
          <Route path="trainers/icm" element={<ICMTrainer />} />
          <Route path="trainers/3bet" element={<ThreeBetTrainer />} />
          <Route path="trainers/cbet" element={<CbetTrainer />} />
          <Route path="trainers/turn-barrel" element={<TurnBarrelTrainer />} />
          <Route path="trainers/river" element={<RiverDecisionTrainer />} />
          <Route path="trainers/push-fold" element={<PushFoldTrainer />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
