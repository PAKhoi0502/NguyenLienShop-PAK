import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import CustomScrollbars from './components/CustomScrollbars';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import './App.scss';
import reduxStore, { persistor } from './redux';
import { ToastContainer } from 'react-toastify';

function App() {
    return (
        <Provider store={reduxStore}>
            <BrowserRouter>
                <React.StrictMode>
                    <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                        <Toaster />
                        <AppRoutes />
                    </CustomScrollbars>
                    <ToastContainer position="bottom-right" autoClose={2000} />

                </React.StrictMode>
            </BrowserRouter>
        </Provider>
    );
}

export default App;