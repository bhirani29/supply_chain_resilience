import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [agentData, setAgentData] = useState({
    S0: [], S1: [], S2: [], R0: [], R1: []
  });
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get('http://localhost:5000/api/step');
        const newData = result.data.data;
        setAgentData((prev) => {
          const updated = { ...prev };
          newData.forEach((d) => {
            updated[d.agent_id] = [...(updated[d.agent_id] || []), Math.max(0, d.value)].slice(-10);
          });
          return updated;
        });
        setMessages((prev) => [...prev, ...result.data.messages].slice(-20));
        setStep((prev) => prev + 1);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: Array.from({ length: Math.min(step, 10) }, (_, i) => `Step ${i + Math.max(1, step - 9)}`),
    datasets: [
      {
        label: 'S0 Inventory',
        data: agentData.S0,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true
      },
      {
        label: 'S1 Inventory',
        data: agentData.S1,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        fill: true
      },
      {
        label: 'S2 Inventory',
        data: agentData.S2,
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        fill: true
      },
      {
        label: 'R0 Stock',
        data: agentData.R0,
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        fill: true
      },
      {
        label: 'R1 Stock',
        data: agentData.R1,
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(156, 39, 176, 0.2)',
        fill: true
      }
    ]
  };

  const handleReset = async () => {
    try {
      await axios.get('http://localhost:5000/api/reset');
      setAgentData({ S0: [], S1: [], S2: [], R0: [], R1: [] });
      setMessages([]);
      setStep(0);
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const formatMessage = (msg) => {
    if (msg.type === 'order') {
      return `${msg.agent_id} ordered ${msg.quantity} units`;
    } else if (msg.type === 'fulfillment') {
      return `${msg.agent_id} fulfilled ${msg.quantity} units for ${msg.to}`;
    } else if (msg.type === 'restock') {
      return `${msg.agent_id} restocked ${msg.quantity} units`;
    } else if (msg.type === 'low_inventory') {
      return `${msg.agent_id} has low inventory: ${msg.stock}`;
    }
    return JSON.stringify(msg);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supply Chain Resilience MVP</h1>
      <button onClick={handleReset} style={{ marginBottom: '10px' }}>Reset Simulation</button>
      <Line
        data={chartData}
        options={{
          scales: {
            x: { title: { display: true, text: 'Simulation Step' } },
            y: {
              title: { display: true, text: 'Inventory/Stock' },
              min: 0
            }
          },
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const agent = context.dataset.label.split(' ')[0];
                  return `${agent}: ${context.raw} ${agent.startsWith('S') ? 'Inventory' : 'Stock'}`;
                }
              }
            }
          }
        }}
      />
      <h2>Agent Messages</h2>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{formatMessage(msg)}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;