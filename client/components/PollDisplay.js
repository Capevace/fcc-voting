import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

import { pollVotesToData, colors } from '../utils/poll-votes-to-data';
import { Row, Col, Container } from './Grid';
import AlertBox from './AlertBox';
import Loader from './Loader';

class PollContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      poll: null,
      selectedOption: null,
      voteByUser: null,
      customOptionInput: ''
    };

    // Request cancel helpers
    this.cancelPollRequest = null;
    this.cancelVoteRequest = null;

    // Bind methods
    this.selectOption = this.selectOption.bind(this);
    this.vote = this.vote.bind(this);
    this.delete = this.delete.bind(this);
    this.addOption = this.addOption.bind(this);
    this.updateCustomOptionInput = this.updateCustomOptionInput.bind(this);
  }

  // Updates the state and detects, if user has already voted and so on
  updatePoll(poll) {
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
      error: !poll,
      poll: poll,
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
      .then(result => this.updatePoll(result.data.poll))
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.error(error);
          this.setState({
            loading: false,
            error: true,
            poll: null
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
          error: true,
          polls: null
        });
      });
  }

  addOption(event) {
    event.preventDefault();

    if (this.state.voteByUser) {
      alert('You\'ve already voted on this poll.');
      return false;
    }

    this.setState({ loading: true });

    axios
      .post(`/api/poll/${this.state.poll._id}/add-option`, {
        optionBody: this.state.customOptionInput,
        cancelToken: new axios.CancelToken((cancelFunction) => {
          this.cancelVoteRequest = () => {
            this.cancelVoteRequest = null;
            cancelFunction();
          };
        })
      })
      .then(result => this.updatePoll(result.data.poll))
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.error(error);
          this.setState({
            loading: false,
            error: true,
            poll: null
          });
        }
      });
  }

  updateCustomOptionInput(event) {
    this.setState({
      customOptionInput: event.target.value
    });
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
      .then(result => this.updatePoll(result.data.poll))
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.error(error);
          this.setState({
            loading: false,
            error: true,
            poll: null,
            voteByUser: null,
            selectedOption: null
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

  render() {
    return this.state.loading
      ? <Loader loading />
      : (this.state.error || !this.state.poll)
        ? this.renderError()
        : <PollDisplay
            poll={this.state.poll}
            selectedOption={this.state.selectedOption}
            voteByUser={this.state.voteByUser}
            onSelect={this.selectOption}
            onVote={this.vote}
            onDelete={this.delete}
            onAdd={this.addOption}
            isAuthor={this.props.user
              && this.state.poll
              && this.state.poll.author === this.props.user._id
            }
            isLoggedIn={!!this.props.user}
            onCustomOptionChange={this.updateCustomOptionInput}
            customOptionInput={this.state.customOptionInput}
          />;
  }
}

function PollDisplay({
  poll,
  selectedOption,
  voteByUser,
  onVote,
  onSelect,
  onDelete,
  onAdd,
  isAuthor,
  isLoggedIn,
  onCustomOptionChange,
  customOptionInput
}) {
  const selectedOptionId = selectedOption
    ? selectedOption._id
    : '';

  return (
    <Container>
      <Row className="mb-4">
        <Col xs={12}>
          <h2>Poll: {poll.question}</h2>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <p>Please Vote:</p>

          <div className="list-group">
            {poll.options.map((option, index) =>
              <button
                key={index}
                onClick={e => onSelect(e, option)}
                disabled={!!voteByUser}
                className={`
                  list-group-item
                  ${selectedOptionId === option._id
                    ? 'active'
                    : ''
                  }
                `}>
                {option.body}
              </button>
            )}

            {isLoggedIn && !voteByUser &&
              <div className="list-group-item">
                <form style={{ width: '100%'}} onSubmit={onAdd}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your answer"
                      onChange={onCustomOptionChange}
                      value={customOptionInput} />

                    <span className="input-group-btn">
                      <button className="btn btn-outline-primary" type="submit">Add Option</button>
                    </span>
                  </div>
                </form>
              </div>}
          </div>

          <button
            onClick={onVote}
            disabled={!!voteByUser}
            className={`btn btn-primary btn-lg mt-4`} >
            {voteByUser
              ? 'You\'ve voted already'
              : 'Vote'}
          </button>
        </Col>

        <Col xs={6}>
          <div>
            <VoteGraph poll={poll} />
          </div>

          {isAuthor &&
            <div className="d-flex justify-content-end mt-3">
              <button
                onClick={onDelete}
                className="btn btn-outline-danger align-self-end">
                Delete Poll
              </button>
            </div>
          }
        </Col>
      </Row>
    </Container>
  );
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

export default connect(mapStateToProps)(PollContainer);
