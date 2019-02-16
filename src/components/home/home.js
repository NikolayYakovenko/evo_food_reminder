import React from 'react';
import PropTypes from 'prop-types';

import css from './home.css';


export const Home = (props) => {
    return (
        <div className={css.wrapper}>
            {props.children}
        </div>
    );
};

Home.propTypes = {
    children: PropTypes.any.isRequired,
};
