import React from 'react';
import { Link } from 'react-router-dom';

import jam from './jam.jpg';
import css from './notFoundRoute.css';


export const NotFoundRoute = () => {
    return (
        <div className={css.notFoundWrapper}>
            <b>404 ERROR</b>
            <p className={css.notFoundText}>No page found</p>
            <Link to='/'>
                Go to the main page
            </Link>
            <div>
                <img
                    className={css.notFoundImage}
                    src={jam}
                    alt='jam'
                />
            </div>
        </div>
    );
};

