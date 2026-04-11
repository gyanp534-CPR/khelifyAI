import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import MatchDetail from './pages/MatchDetail';
import Series from './pages/Series';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 2000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/match/:id"     element={<MatchDetail />} />
          <Route path="/series"        element={<Series />} />
          <Route path="/players"       element={<Players />} />
          <Route path="/player/:id"    element={<PlayerDetail />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
