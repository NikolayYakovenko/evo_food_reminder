import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import '../styles/reset.css';
import '../styles/base.css';

import { Home } from './home/home';
import { MainPage } from './mainPage/mainPage';
import { StatisticPage } from './statisticPage/statisticPage';

import { NotFoundRoute } from './ui/notFoundRoute/notFoundRoute';


export const App = () => {
    return (
        <BrowserRouter >
            <Home>
                <Switch>
                    <Route path='/' exact component={MainPage} />
                    <Route path='/stat' exact component={StatisticPage} />
                    <Route component={NotFoundRoute} />
                </Switch>
            </Home>
        </BrowserRouter>
    );
};
