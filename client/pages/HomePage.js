import React from 'react';
import { Row, Col } from '../components/Grid';
import PollContainer from '../components/PollContainer';

function HomePage() {
  return (
    <div>
      <Row className="mb-4">
        <Col xs={12}>
          <h2>Latest Polls</h2>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <PollContainer />
        </Col>
      </Row>
    </div>
  );
}

export default HomePage;
