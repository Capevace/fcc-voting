import React from 'react';

import PollDisplay from '../components/PollDisplay';

function PollPage({ params }) {
  return <PollDisplay id={params.id} />;
}

export default PollPage;
