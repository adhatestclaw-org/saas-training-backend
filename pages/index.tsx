import type { NextPage } from 'next';
import Layout from '../components/Layout';
import { useEffect, useState } from 'react';

interface Recommendation {
  sport: string;
  home_team: string;
  away_team: string;
  start_time: string;
  predicted_ev: number;
}
import Chart from '../components/Chart';

const Home: NextPage = () => {
  // State for recommendations
  const [data, setData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recommendations via local API route

    fetch('/api/recommendations')
      .then(res => res.json())
      .then(json => setData(json.upcoming || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Split upcoming and value bets
  const upcoming = data;
  const valueBets = data.filter(r => r.predicted_ev > 0);


  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Sample performance chart */}
        <div className="bg-white p-6 rounded-lg shadow xl:col-span-3">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Portfolio Performance</h2>
          <Chart
            label="EV Trend"
            labels={["Week 1", "Week 2", "Week 3", "Week 4"]}
            data={[5, 7, 3, 8]}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-800">Upcoming Matches</h2>
          {loading ? (
            <p className="mt-4 text-gray-600">Loading...</p>
          ) : upcoming.length === 0 ? (
            <p className="mt-4 text-gray-600">No upcoming matches.</p>
          ) : (
            <ul className="list-disc pl-5 text-gray-700 mt-4">
              {upcoming.map((m, i) => (
                <li key={i} className="mb-2">
                  {m.home_team} vs {m.away_team} @ {new Date(m.start_time).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-800">Value Bets</h2>
          {loading ? (
            <p className="mt-4 text-gray-600">Loading...</p>
          ) : valueBets.length === 0 ? (
            <p className="mt-4 text-gray-600">No value bets at this time.</p>
          ) : (
            <ul className="list-disc pl-5 text-gray-700 mt-4">
              {valueBets.map((m, i) => (
                <li key={i} className="mb-2">
                  {m.home_team} vs {m.away_team} — EV: {m.predicted_ev.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-800">Portfolio Value</h2>
          <p className="mt-4 text-gray-600">$0.00</p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;