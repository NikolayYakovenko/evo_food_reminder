import React from 'react';
import { Link } from 'react-router-dom';

import css from './statisticPage.css';


export const StatisticPage = () => {
    return (
        <div className={css.track}>
            <h1>Statistic Page</h1>
            <Link to='/'>Main page</Link>
        </div>
    );
};
