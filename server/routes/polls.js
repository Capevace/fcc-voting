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
      .catch(error => {
        console.error(error);
        res.status(500).json({
          status: 500,
          message: 'Internal server error.',
          polls: []
        });
      });
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
        res.json({
          poll: result
        });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({
          status: 500,
          message: 'Internal server error.'
        });
      });
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
      .catch(err => {
        console.error(err);
        res.status(500).json({
          status: 500,
          message: 'Internal server error.'
        });
      });
  });

  app.post('/api/poll/:id/vote', (req, res) => {
    if (!req.body.optionId) {
      res.status(400).json({
        status: 400,
        message: 'Please provide an optionId'
      });
      return;
    }

    const ip = requestIp.getClientIp(req);

    Poll.findOne({ _id: req.params.id })
      .then(poll => {
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
          option: req.body.optionId
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
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({
          status: 500,
          message: 'Internal server error.'
        });
      });
  });

  app.get('/api/ip', (req, res) => {
    res.json({ ip: requestIp.getClientIp(req) });
  });
};
