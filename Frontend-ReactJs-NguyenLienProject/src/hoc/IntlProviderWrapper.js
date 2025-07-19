import React from 'react';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { LanguageUtils } from '../utils';

const messages = LanguageUtils.getFlattenedMessages();

const IntlProviderWrapper = ({ children }) => {
    const language = useSelector((state) => state.app.language);

    return (
        <IntlProvider
            locale={language}
            messages={messages[language]}
            defaultLocale="vi"
        >
            {children}
        </IntlProvider>
    );
};

export default IntlProviderWrapper;