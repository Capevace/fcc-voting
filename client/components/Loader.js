import React from 'react';
import { Row, Col } from './Grid';

function Loader({ loading = true, label = 'Loading' }) {
  return loading
    ? <Row className="my-5">
      <Col xs={12} className="my-5">
        <p className="display-4 text-center">{label}</p>
      </Col>
    </Row>
    : <span></span>;
}

export default Loader;
