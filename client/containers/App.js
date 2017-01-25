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
