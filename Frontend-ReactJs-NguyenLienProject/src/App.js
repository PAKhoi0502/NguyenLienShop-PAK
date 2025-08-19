import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import CustomScrollbars from './components/CustomScrollbars';
import AppRoutes from './routes/AppRoutes';
import AuthDebugSafe from './components/AuthDebugSafe'; // ✅ Safe debug component
import { Toaster } from 'react-hot-toast';
import './App.scss';
import reduxStore from './redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <Provider store={reduxStore}>
            <BrowserRouter>
                <React.StrictMode>
                    <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                        {/* 🔥 React Hot Toast - Modern toast system */}
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                style: {
                                    background: 'transparent',
                                    boxShadow: 'none',
                                    padding: 0,
                                    margin: 0,
                                },
                                duration: 4000, // 4 giây auto-close
                                icon: false, // 🚫 Disable default icons
                                success: {
                                    icon: false, // 🚫 No success icon
                                    duration: 4000, // Success toast 4 giây
                                },
                                error: {
                                    icon: false, // 🚫 No error icon
                                    duration: 5000, // Error toast 5 giây (lâu hơn)
                                },
                                loading: {
                                    duration: Infinity, // Loading toast không tự ẩn
                                },
                            }}
                            containerStyle={{
                                bottom: 20,
                                right: 20,
                                zIndex: 10000,
                            }}
                        />

                        <AppRoutes />

                        {/* 🔍 Enhanced Debug Panel - Only in Development */}
                        {process.env.NODE_ENV === 'development' && <AuthDebugSafe />}
                    </CustomScrollbars>

                    {/* 📢 React Toastify - Legacy toast system */}
                    <ToastContainer
                        position="bottom-right"
                        autoClose={4000} // 4 giây auto-close
                        hideProgressBar={false} // Hiển thị progress bar
                        newestOnTop={true} // Toast mới ở trên
                        closeOnClick={true} // Click để đóng
                        rtl={false}
                        pauseOnFocusLoss={true} // Pause khi lose focus
                        draggable={true} // Có thể kéo
                        pauseOnHover={true} // Pause khi hover
                        style={{ zIndex: 10001 }}
                    />
                </React.StrictMode>
            </BrowserRouter>
        </Provider>
    );
}

export default App;