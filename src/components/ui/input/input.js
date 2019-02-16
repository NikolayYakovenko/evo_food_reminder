import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';

import css from './input.css';


export const Input = (props) => {
    const classes = cs(css.input, props.className);
    return (
        <input
            className={classes}
            type='text'
            ref={props.refFn}
            onChange={props.onChange}
            placeholder={props.placeholder}
        />
    );
};

Input.defaultProps = {
    placeholder: '',
    className: '',
    onChange: null,
};

Input.propTypes = {
    onChange: PropTypes.func,
    refFn: PropTypes.object,
    className: PropTypes.string,
    placeholder: PropTypes.string,
};
