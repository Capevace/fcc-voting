import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from '../components/Grid';
import PollContainer from '../components/PollContainer';

function MyPollsPage({ userId }) {
  return (
    <div>
      <Row className="mb-4">
        <Col xs={12}>
          <h2>My Polls</h2>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <PollContainer user={userId} />
        </Col>
      </Row>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    userId: state.auth.user ? state.auth.user._id : null
  };
};

export default connect(mapStateToProps)(MyPollsPage);
