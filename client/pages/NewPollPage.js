import React from 'react';
import axios from 'axios';
import { browserHistory } from 'react-router';

import AlertBox from '../components/AlertBox';
import { Container, Row, Col } from '../components/Grid';
import Loader from '../components/Loader';

class NewPollPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      creating: false,
      error: false,
      formData: {
        question: '',
        options: []
      }
    };

    this.submitForm = this.submitForm.bind(this);
    this.updateQuestion = this.updateQuestion.bind(this);
    this.updateOptions = this.updateOptions.bind(this);
  }

  submitForm(event) {
    event.preventDefault();

    axios
      .post('/api/poll', {
        question: this.state.formData.question,
        options: this.state.formData.options
      })
      .then(result => {
        browserHistory.push('/my-polls');
      })
      .catch(error => {
        console.error(error);
        this.setState({
          creating: false,
          error: true,
          formData: {
            question: '',
            options: []
          }
        });
      });
  }

  updateQuestion(event) {
    this.setState({
      formData: {
        ...this.state.formData,
        question: event.target.value
      }
    });
  }

  updateOptions(event) {
    this.setState({
      formData: {
        ...this.state.formData,
        options: event.target.value.split('\n') || []
      }
    });
  }

  renderError() {
    return (
      <Container>
        <AlertBox type="danger"><strong>An error occurred.</strong> Please check your input.</AlertBox>
      </Container>
    );
  }

  renderForm() {
    return (
      <Row>
        <Col xs="8">
          <form method="post" onSubmit={this.submitForm}>
            <div className="form-group">
              <label htmlFor="question">Question</label>
              <input
                type="text"
                className="form-control"
                id="question"
                aria-describedby="questionHelp"
                placeholder="Enter your question"
                value={this.state.formData.question}
                onChange={this.updateQuestion} />
              <small
                id="questionHelp"
                className="form-text text-muted">
                Questions usually end with a question mark.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="options">Options</label>
              <textarea
                className="form-control"
                id="options"
                rows="3"
                name="options"
                placeholder="Enter your options"
                value={this.state.formData.options.join('\n')}
                onChange={this.updateOptions} >
              </textarea>
              <small id="optionsHelp" className="form-text text-muted">
                Separate options by line breaks.
              </small>
            </div>
            <button type="submit" className="btn btn-primary btn-lg mt-2">Create Poll</button>
          </form>
        </Col>
        <Col xs="4">
          Something
        </Col>
      </Row>
    );
  }

  render() {
    return (
      <Container>
        {this.state.creating
          ? <Loader label="Creating" />
          : (this.state.error)
            ? this.renderError()
            : this.renderForm()
        }
      </Container>
    );
  }
}

export default NewPollPage;
