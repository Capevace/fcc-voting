
const initialState = {
  user: null,
  isLoggedIn: false,
};

function auth(state = initialState, action) {
  switch (action.type) {
    case 'LOGIN_STATUS_CHANGE':
      return {
        ...state,
        user: action.user,
        isLoggedIn: !!action.user
      };
      break;
    default:
      return state;
  }
}

export default auth;
