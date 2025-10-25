import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
    FaUser,
    FaMapMarkerAlt,
    FaEnvelope,
    FaLock,
    FaSignOutAlt,
    FaChevronRight
} from 'react-icons/fa';
import './AccountPage.scss';
import ProfileInfo from './ProfileInfo';
import ChangePassword from './ChangePassword';
import UpdateEmail from './UpdateEmail';

const AccountPage = () => {
    const { isLoggedIn } = useSelector((state) => state.admin);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    if (!isLoggedIn) {
        navigate('/login');
        return null;
    }

    // Menu items configuration
    const menuItems = [
        {
            id: 'profile',
            icon: <FaUser />,
            labelId: 'profile.title.profile_info',
            defaultLabel: 'Thông tin cá nhân',
            component: <ProfileInfo />
        },
        {
            id: 'address',
            icon: <FaMapMarkerAlt />,
            labelId: 'profile.title.address',
            defaultLabel: 'Sổ địa chỉ',
            component: <div className="coming-soon">Đang phát triển...</div>
        },
        {
            id: 'email',
            icon: <FaEnvelope />,
            labelId: 'profile.title.update_email',
            defaultLabel: 'Cập nhật email',
            component: <UpdateEmail />
        },
        {
            id: 'password',
            icon: <FaLock />,
            labelId: 'profile.title.change_password',
            defaultLabel: 'Thay đổi mật khẩu',
            component: <ChangePassword />
        }
    ];

    const handleLogout = () => {
        navigate('/logout');
    };

    const activeMenuItem = menuItems.find(item => item.id === activeTab);

    return (
        <div className="account-page">
            <div className="account-page__container">
                {/* Sidebar - Trang tài khoản */}
                <aside className="account-sidebar">
                    <div className="account-sidebar__header">
                        <h2>
                            <FormattedMessage id="profile.title.account_page" defaultMessage="Trang tài khoản" />
                        </h2>
                    </div>

                    <nav className="account-sidebar__menu">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                className={`account-sidebar__item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <span className="account-sidebar__icon">{item.icon}</span>
                                <span className="account-sidebar__label">
                                    <FormattedMessage id={item.labelId} defaultMessage={item.defaultLabel} />
                                </span>
                                <FaChevronRight className="account-sidebar__arrow" />
                            </button>
                        ))}

                        {/* Logout button */}
                        <button
                            className="account-sidebar__item account-sidebar__item--logout"
                            onClick={handleLogout}
                        >
                            <span className="account-sidebar__icon">
                                <FaSignOutAlt />
                            </span>
                            <span className="account-sidebar__label">
                                <FormattedMessage id="profile.title.logout" defaultMessage="Đăng xuất tài khoản" />
                            </span>
                            <FaChevronRight className="account-sidebar__arrow" />
                        </button>
                    </nav>
                </aside>

                {/* Main Content - Thông tin cá nhân */}
                <main className="account-content">
                    <div className="account-content__header">
                        <h1>
                            <FormattedMessage
                                id={activeMenuItem?.labelId}
                                defaultMessage={activeMenuItem?.defaultLabel}
                            />
                        </h1>
                    </div>

                    <div className="account-content__body">
                        {activeMenuItem?.component}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AccountPage;

