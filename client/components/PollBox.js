import React from 'react';
import { Link } from 'react-router';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { pollVotesToData, colors } from '../utils/poll-votes-to-data';

function PollBox({ poll }) {
  const data = pollVotesToData(poll);
  return (
    <div className="card mb-4">
      <div className="mt-3">
        <ResponsiveContainer height={75}>
          <PieChart height={300} onMouseEnter={() => {}}>
            <Pie
              data={data}
              innerRadius={0}
              outerRadius={30}
            >
            	{
              	data.map((entry, index) => <Cell fill={colors[index % colors.length]} />)
              }
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="card-block">
        <h5 className="mb-0"><Link to={`/poll/${poll._id}`}>{poll.question}</Link></h5>
      </div>
    </div>
  );
}

export default PollBox;
