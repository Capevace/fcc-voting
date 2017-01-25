import React from 'react';
import { connect } from 'react-redux';

import Header from './Header';
import { Container } from '../components/Grid';

function App({ children, loading }) {
  return (
    <div>
      <Header />
      <Container className="mt-4">
        {loading
          ? 'Loading'
          : children
        }
      </Container>
      <Container className="mt-3">
        Made by Lukas von Mateffy (
          <a href="https://twitter.com/Capevace">@Capevace</a>&nbsp;|&nbsp;
          <a href="http://smoolabs.com">smoolabs.com</a>&nbsp;|&nbsp;
          <a href="https://github.com/Capevace">GitHub</a>
        )
      </Container>
      {/* <Footer /> */}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loading: state.loading > 0
  };
};

export default connect(mapStateToProps)(App);
