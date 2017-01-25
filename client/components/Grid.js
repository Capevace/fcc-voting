import React from 'react';

export const Col = ({ xs, sm, md, lg, xl, children, className = '' }) => {
  let colClass = '';

  if (xs) {
    colClass += `col-${xs} `;
  }

  if (sm) {
    colClass += `col-sm-${sm} `;
  }

  if (md) {
    colClass += `col-md-${md} `;
  }

  if (lg) {
    colClass += `col-lg-${lg} `;
  }

  if (xl) {
    colClass += `col-xl-${xl}`;
  }

  return <div className={`${colClass} ${className}`}>{children}</div>;
}

export const Row = ({ children, className = '' }) =>
  <div className={`row ${className}`}>{children}</div>;

export const Container = ({ children, className = '' }) =>
  <div className={`container ${className}`}>{children}</div>;

export const FluidContainer = ({ children, className = '' }) =>
  <div className={`container-fluid ${className}`}>{children}</div>;

export default {
  Col,
  Row,
  Container,
  FluidContainer
};
