import React from "react";
import Select from "react-select";
import vietnamFlag from "../../assets/icon/header/language/vietnam.png";
import usFlag from "../../assets/icon/header/language/us.png";
import "./LanguageSelect.scss";

const options = [
    { value: "vi", label: "VI", icon: vietnamFlag },
    { value: "en", label: "EN", icon: usFlag },
];

const LanguageSelect = ({ value, onChange }) => {
    const formatOptionLabel = ({ label, icon }) => (
        <div className="lang-option">
            <img src={icon} alt={label} className="lang-flag" />
            <span>{label}</span>
        </div>
    );

    return (
        <Select
            options={options}
            value={options.find((opt) => opt.value === value)}
            onChange={(selected) => onChange(selected.value)}
            classNamePrefix="lang-select"
            formatOptionLabel={formatOptionLabel}
            isSearchable={false}
        />
    );
};

export default LanguageSelect;
