const { Types } = require('mongoose');
const requestIp = require('request-ip');
const { Poll } = require('../schemas');

module.exports = (app) => {
  app.get('/api/polls', (req, res) => {
    const query = req.query.user
      ? { author: req.query.user }
      : {};

    Poll.find(query)
      .sort({ 'createdAt': 'desc' })
      .limit(10)
      .then(results => {
        res.json({
          polls: results
        });
      })
      .catch(err => throwInternalError(err, res));
  });

  app.post('/api/poll', (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        status: 401,
        message: 'You gotta be logged in.'
      });
      return;
    }

    if (!(req.body.question && req.body.options && Array.isArray(req.body.options) || req.body.options.length > 0)) {
      res.status(400).json({
        status: 400,
        message: 'You didn\'t fill out the form properly.'
      });
      return;
    }

    Poll.create({
      question: req.body.question,
      author: req.user._id,
      votes: [],
      options: req.body.options.map(option => ({ body: option })),
      createdAt: new Date()
    });

    res.status(200).json({
      status: 200
    });
  });

  app.get('/api/poll/:id', (req, res) => {
    Poll.findOne({ _id: req.params.id })
      .then(result => {
        if (result) {
          res.json({
            poll: result
          });
        } else {
          res.status(404).json({
            status: 404,
            message: `Poll with id ${req.params.id} wasn't found.`
          });
        }
      })
      .catch(err => throwInternalError(err, res));
  });

  app.delete('/api/poll/:id', (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        status: 401,
        message: 'You have to be logged in.'
      });
      return;
    }

    Poll.remove({ _id: req.params.id, author: req.user._id })
      .then(() => {
        res.json({
          status: 200
        });
      })
      .catch(err => throwInternalError(err, res));
  });

  app.post('/api/poll/:id/vote', (req, res) => {
    Poll.findOne({ _id: req.params.id })
      .then(poll => voteFor(poll, req.body.optionId, req, res))
      .catch(err => throwInternalError(err, res));
  });

  app.post('/api/poll/:id/add-option', (req, res) => {
    const pollId = req.params.id;
    const optionBody = req.body.optionBody;
    let optionId = '';

    if (!optionBody) {
      res.status(400).json({
        status: 400,
        message: 'Please provide an option body.'
      });
      return;
    }

    Poll.findOne({ _id: req.params.id })
      .then(poll => {
        if (!poll) {
          res.status(404).json({
            status: 404,
            message: 'Poll not found'
          });
          return;
        }

        poll.options.push({ body: optionBody });
        optionId = poll.options[poll.options.length - 1]._id;

        return poll.save();
      })
      .then(poll => voteFor(poll, optionId, req, res))
      .catch(err => throwInternalError(err, res));
  });

  app.get('/api/ip', (req, res) => {
    res.json({ ip: requestIp.getClientIp(req) });
  });

  function voteFor(poll, optionId, req, res) {
    if (!optionId) {
      res.status(400).json({
        status: 400,
        message: 'Please provide an optionId'
      });
      return;
    }

    const ip = requestIp.getClientIp(req);

    // Check if votes
    const canceled = poll.votes
      .reduce((canceled, vote) => {
        if (canceled) return canceled;

        if (req.isAuthenticated() && vote.user === req.user._id) {
          return true;
        }

        // If ip is saved, we cant vote again
        if ((vote.ip && vote.ip === ip)) {
          return true;
        }

        return false;
      }, false);

    if (canceled) {
      res.status(403).json({
        status: 403,
        message: 'Vote already placed.'
      });
      return;
    }

    let vote = {
      ip,
      option: optionId
    };

    // check wether we should add by user or ip
    if (req.isAuthenticated()) {
      vote.user = req.user._id;
    }

    poll.votes.push(vote);
    poll.save();

    res.json({
      status: 200,
      poll: poll
    });
  }

  function throwInternalError(err, res) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error.'
    });
  }
};
