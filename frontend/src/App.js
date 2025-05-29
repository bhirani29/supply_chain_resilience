import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [data, setData] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get('http://localhost:5000/api/step');
      setData(result.data.data);
      setMessages(result.data.messages);
    };
    fetchData();
  }, []);

  const chartData = {
    labels: data.map(d => d.agent_id),
    datasets: [{
      label: 'Inventory/Stock',
      data: data.map(d => d.value),
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      fill: true
    }]
  };

  return (
    <div>
      <h1>Supply Chain Resilience MVP</h1>
      <Line data={chartData} />
      <h2>Agent Messages</h2>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{JSON.stringify(msg)}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;