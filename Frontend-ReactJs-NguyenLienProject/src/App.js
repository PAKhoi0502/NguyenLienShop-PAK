import React from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { history } from './redux';

import AppRoutes from './routes/AppRoutes';
import { Provider } from 'react-redux';
import store from './redux';
import './App.scss';

function App() {
    return (
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <AppRoutes />
            </ConnectedRouter>
        </Provider>

    );
}

export default App;
