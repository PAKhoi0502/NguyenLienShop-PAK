import React, { useState, useEffect, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import './Navigator.scss';

// MenuGroup component
const MenuGroup = React.forwardRef(({ name, children }, ref) => {
    return (
        <li className="menu-group" ref={ref}>
            <div className="menu-group-name">
                <FormattedMessage id={name} />
            </div>
            <ul className="menu-list list-unstyled">{children}</ul>
        </li>
    );
});

// Menu component
const Menu = React.forwardRef(({ name, active, link, children, onClick, hasSubMenu, onLinkClick }, ref) => {
    const location = useLocation();
    const isActive = hasSubMenu
        ? children.some(child => child.props.link === location.pathname)
        : link === location.pathname;

    return (
        <li className={"menu" + (hasSubMenu ? " has-sub-menu" : "") + (isActive ? " active" : "")} ref={ref}>
            {hasSubMenu ? (
                <Fragment>
                    <span
                        data-toggle="collapse"
                        className={"menu-link collapsed" + (active ? " active" : "")}
                        onClick={onClick}
                        aria-expanded={active ? "true" : "false"}
                    >
                        <FormattedMessage id={name} />
                        <div className="icon-right">
                            <i className={"far fa-angle-right"} />
                        </div>
                    </span>
                    <div>
                        <ul className="sub-menu-list list-unstyled">{children}</ul>
                    </div>
                </Fragment>
            ) : (
                <Link to={link} className="menu-link" onClick={onLinkClick}>
                    <FormattedMessage id={name} />
                </Link>
            )}
        </li>
    );
});

// SubMenu component
const SubMenu = React.forwardRef(({ name, link, onLinkClick }, ref) => {
    const location = useLocation();

    const getItemClass = () => (location.pathname === link ? "active" : "");

    return (
        <li className={"sub-menu " + getItemClass()} ref={ref}>
            <Link to={link} className="sub-menu-link" onClick={onLinkClick}>
                <FormattedMessage id={name} />
            </Link>
        </li>
    );
});

// Navigator component
const Navigator = React.forwardRef(({ menus, onLinkClick }, ref) => {
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState({});

    const toggle = (groupIndex, menuIndex) => {
        const key = `${groupIndex}_${menuIndex}`;
        setExpandedMenu(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const isMenuHasSubMenuActive = (subMenus, link) => {
        if (subMenus && subMenus.length > 0) {
            return subMenus.some(subMenu => subMenu.link === location.pathname);
        }
        return link && link === location.pathname;
    };

    const checkActiveMenu = () => {
        for (let i = 0; i < menus.length; i++) {
            const group = menus[i];
            if (group.menus && group.menus.length > 0) {
                for (let j = 0; j < group.menus.length; j++) {
                    const menu = group.menus[j];
                    if (menu.subMenus && menu.subMenus.length > 0) {
                        if (isMenuHasSubMenuActive(menu.subMenus, null)) {
                            setExpandedMenu({ [`${i}_${j}`]: true });
                            return;
                        }
                    }
                }
            }
        }
    };

    useEffect(() => {
        checkActiveMenu();
    }, [location.pathname, menus]);

    return (
        <Fragment>
            <ul className="navigator-menu list-unstyled" ref={ref}>
                {menus.map((group, groupIndex) => (
                    <Fragment key={groupIndex}>
                        <MenuGroup name={group.name}>
                            {group.menus &&
                                group.menus.map((menu, menuIndex) => {
                                    const isMenuHasSubMenuActiveResult = isMenuHasSubMenuActive(menu.subMenus, menu.link);
                                    const isSubMenuOpen = expandedMenu[`${groupIndex}_${menuIndex}`] === true;
                                    return (
                                        <Menu
                                            key={menuIndex}
                                            active={isMenuHasSubMenuActiveResult}
                                            name={menu.name}
                                            link={menu.link}
                                            hasSubMenu={menu.subMenus}
                                            onClick={() => toggle(groupIndex, menuIndex)}
                                            onLinkClick={onLinkClick}
                                        >
                                            {menu.subMenus &&
                                                menu.subMenus.map((subMenu, subMenuIndex) => (
                                                    <SubMenu
                                                        key={subMenuIndex}
                                                        name={subMenu.name}
                                                        link={subMenu.link}
                                                        onLinkClick={onLinkClick}
                                                    />
                                                ))}
                                        </Menu>
                                    );
                                })}
                        </MenuGroup>
                    </Fragment>
                ))}
            </ul>
        </Fragment>
    );
});

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigator);