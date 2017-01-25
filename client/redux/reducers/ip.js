
function ip(state = null, action) {
  switch (action.type) {
    case 'IP_UPDATED':
      return action.ip;
      break;
    default:
      return state;
  }
}

export default ip;
