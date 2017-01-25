import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

import { pollVotesToData, colors } from '../utils/poll-votes-to-data';
import { Row, Col } from './Grid';
import AlertBox from './AlertBox';

class PollDisplay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      poll: null,
      error: false,
      selectedOption: null,
      voteByUser: null
    };

    this.cancelPollRequest = null;
    this.vote = this.vote.bind(this);
    this.delete = this.delete.bind(this);
  }

  componentDidMount() {
    axios
      .get(`/api/poll/${this.props.id}`, {
        cancelToken: new axios.CancelToken((cancelFunction) => {
          this.cancelPollRequest = () => {
            this.cancelPollRequest = null;
            cancelFunction();
          };
        })
      })
      .then(result => {
        this.setPoll(result.data.poll);
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.error(error);
          this.setState({
            loading: false,
            poll: null,
            error: true
          });
        }
      });
  }

  componentWillUnmount() {
    if (this.cancelPollRequest)
      this.cancelPollRequest();

    if (this.cancelVoteRequest)
      this.cancelVoteRequest();
  }

  setPoll(poll) {
    let voteByUser = null;
    let selectedOption = null;

    if (poll) {
      voteByUser = poll
        .votes
        .reduce((voteByUser, vote) => {
          if (voteByUser) return voteByUser;

          if ((this.props.user && vote.user === this.props.user._id)
            || (this.props.ip && vote.ip === this.props.ip)) {
            return vote;
          }

          return null;
        }, null);

      if (voteByUser) {
        selectedOption = poll
          .options
          .reduce((selectedOption, option) => {
            if (selectedOption) return selectedOption;

            if (option._id === voteByUser.option) {
              return option;
            }

            return null;
          }, null);
      }
    }

    this.setState({
      loading: false,
      poll: poll,
      error: !poll,
      voteByUser,
      selectedOption
    });
  }

  selectOption(event, option) {
    event.preventDefault();

    this.setState({
      selectedOption: option
    });
  }

  vote() {
    // User already voted
    if (this.state.voteByUser) {
      alert('You\'ve already voted on this poll.');
      return false;
    }

    this.setState({ loading: true });

    axios
      .post(`/api/poll/${this.state.poll._id}/vote`, {
        optionId: this.state.selectedOption._id,
        cancelToken: new axios.CancelToken((cancelFunction) => {
          this.cancelVoteRequest = () => {
            this.cancelVoteRequest = null;
            cancelFunction();
          };
        })
      })
      .then(result => {
        this.setPoll(result.data.poll);
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.error(error);
          this.setState({
            loading: false,
            poll: null,
            error: true
          });
        }
      });
  }

  delete() {
    this.setState({ loading: true });

    axios
      .delete(`/api/poll/${this.state.poll._id}`)
      .then(result => {
        browserHistory.push('/');
      })
      .catch(error => {
        console.error(error);
        this.setState({
          loading: false,
          polls: null,
          error: true
        });
      });
  }

  renderError() {
    return (
      <Row>
        <Col xs={12}>
          <AlertBox type="danger">
            <strong>An error occurred.</strong> Please try again later.
          </AlertBox>
        </Col>
      </Row>
    );
  }

  renderPoll() {
    return (
      <div>
        <Row className="mb-4">
          <Col xs={12}>
            <h2>Poll: {this.state.poll.question}</h2>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <p>Please Vote:</p>
            <div className="list-group">
              {this.state.poll.options.map((option, index) => {
                return (
                  <button
                    key={index}
                    onClick={(e) => this.selectOption(e, option)}
                    href="#"
                    disabled={!!this.state.voteByUser}
                    className={`
                      list-group-item
                      ${this.state.selectedOption && this.state.selectedOption._id === option._id
                          ? 'active'
                          : ''
                      }
                      ${this.state.voteByUser
                          ? 'disabled'
                          : ''
                      }
                    `}>
                    {option.body}
                  </button>
                );
              })}
            </div>
            <button
              onClick={this.vote}
              disabled={!!this.state.voteByUser}
              className={`btn btn-primary btn-lg mt-4`}>
              {this.state.voteByUser
                ? 'You\'ve voted already'
                : 'Vote'
              }
            </button>
          </Col>
          <Col xs={6}>
            <div>
              <VoteGraph poll={this.state.poll} />
            </div>

            {this.props.user && this.state.poll && this.state.poll.author === this.props.user._id &&
              <div className="d-flex justify-content-end mt-3">
                <button
                  onClick={this.delete}
                  className="btn btn-outline-danger align-self-end">
                  Delete Poll
                </button>
              </div>
            }
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    console.log(this.state);
    return this.state.loading
      ? <div>Loading</div>
      : (this.state.error || !this.state.poll)
        ? this.renderError()
        : this.renderPoll();
  }
}

function VoteGraph({ poll }) {
  const data = pollVotesToData(poll);
  return (
    <div>
      <ResponsiveContainer height={330}>
        <PieChart onMouseEnter={() => {}}>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={100}
            fill="#3097D1"
            paddingAngle={0}
            label={props => props.payload.value}
            isAnimationActive={false}
          >
            {
              data.map((entry, index) => <Cell key={index} fill={entry.color} label={entry.name} />)
            }
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div>
        <ul>
          {data.map((entry, index) => <li key={index} className="poll-legend">
            <span className="badge" style={{
              background: entry.color
            }}></span>
            {entry.name}
          </li>)}
        </ul>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  console.log('ip', state.ip);
  return {
    user: state.auth.user,
    ip: state.ip
  };
};

export default connect(mapStateToProps)(PollDisplay);
