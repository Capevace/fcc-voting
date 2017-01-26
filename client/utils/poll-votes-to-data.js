export const colors = [
  '#3097D1',
  '#30d196',
  '#d1305d',
  '#8430d1'
];

export function pollVotesToData(poll) {
  const orderedOptions = poll.options.reduce((data, option) => {
    data[option._id] = {
      body: option.body
    };

    return data;
  }, {});

  // console.log(orderedOptions);

  const orderedVotes = poll.votes.reduce((data, vote) => {
    data[vote.option] = {
      option: orderedOptions[vote.option].body,
      count: data[vote.option] ? data[vote.option].count + 1 : 1
    };

    return data;
  }, {});

  const data = Object.keys(orderedVotes)
    .map((voteKey, index) => {
      const vote = orderedVotes[voteKey];

      return {
        name: vote.option,
        value: vote.count,
        color: colors[index % colors.length]
      };
    });

  return data;
}
