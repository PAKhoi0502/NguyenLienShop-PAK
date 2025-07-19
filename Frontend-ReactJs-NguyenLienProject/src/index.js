import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/styles.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import IntlProviderWrapper from './hoc/IntlProviderWrapper';
import { Provider } from 'react-redux';
import reduxStore, { persistor } from './redux';

const root = createRoot(document.getElementById('root'));
root.render(
    <Provider store={reduxStore}>
        <IntlProviderWrapper>
            <App persistor={persistor} />
        </IntlProviderWrapper>
    </Provider>
);

serviceWorker.unregister();
