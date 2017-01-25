import React from 'react';
import axios from 'axios';

import { Row, Col } from './Grid';
import AlertBox from './AlertBox';
import PollBox from './PollBox';

class PollContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      polls: [],
      error: false
    };

    this.cancelPollRequest = null;
  }

  componentDidMount() {
    axios
      .get('/api/polls' + (this.props.user ? '?user=' + this.props.user : ''), {
        cancelToken: new axios.CancelToken((cancelFunction) => {
          this.cancelPollRequest = () => {
            this.cancelPollRequest = null;
            cancelFunction();
          };
        })
      })
      .then(result => {
        this.setState({
          loading: false,
          polls: result.data.polls,
          error: false
        });
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.error(error);
          this.setState({
            loading: false,
            polls: [],
            error: true
          });
        }
      });
  }

  componentWillUnmount() {
    if (this.cancelPollRequest)
      this.cancelPollRequest();
  }

  renderError() {
    return (
      <Row>
        <Col xs={12}>
          <AlertBox type="danger">
            <strong>Error fetching polls.</strong> Please try again later.
          </AlertBox>
        </Col>
      </Row>
    );
  }

  renderPolls() {
    return (
      <Row>
        {this.state.polls.length === 0 && <Col xs={12}>No Polls found</Col>}

        {this.state.polls.map((poll, index) => {
          return (
            <Col
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={index}>
              <PollBox poll={poll} />
            </Col>
          );
        })}
      </Row>
    );
  }

  render() {
    console.log(this.state);
    return (
      <div>
        {this.state.loading
          ? 'Loading'
          : this.state.error
            ? this.renderError()
            : this.renderPolls()
        }
      </div>
    );
  }
}

export default PollContainer;
