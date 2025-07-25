import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../../store/reducers/appReducer';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast';
import './HeaderAdmin.scss';

const HeaderAdmin = () => {
    const language = useSelector((state) => state.app.language);
    const dispatch = useDispatch();

    const handleChangeLanguage = (e) => {
        const lang = e.target.value;
        dispatch(setLanguage(lang));

        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type="info"
                    titleId="header.language_changed"
                    messageId={`header.language_${lang}`}
                    time={new Date()}
                />
            ),
            { closeButton: false, type: "info" }
        );
    };

    return (
        <header className="admin-header">
            <div className="admin-header-left">
            </div>
            <div className="admin-header-right">
                <select
                    className="language-select"
                    value={language}
                    onChange={handleChangeLanguage}
                >
                    <option value="vi">VN</option>
                    <option value="en">EN</option>
                </select>
            </div>
        </header>
    );
};

export default HeaderAdmin;
