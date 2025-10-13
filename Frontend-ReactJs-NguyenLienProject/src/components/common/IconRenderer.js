import React from 'react';
import './IconRenderer.scss';

/**
 * Component để render icon announcement một cách an toàn
 * Hỗ trợ fallback khi emoji không hiển thị được
 */
const IconRenderer = ({ icon, size = 'medium', className = '' }) => {
    // Mapping icon với fallback
    const iconMap = {
        '📢': { emoji: '📢', fallback: '📢', name: 'megaphone' },
        'ℹ️': { emoji: 'ℹ️', fallback: 'ℹ️', name: 'info' },
        '✅': { emoji: '✅', fallback: '✅', name: 'success' },
        '⚠️': { emoji: '⚠️', fallback: '⚠️', name: 'warning' },
        '🎉': { emoji: '🎉', fallback: '🎉', name: 'celebration' },
        '🔧': { emoji: '🔧', fallback: '🔧', name: 'maintenance' },
        '🚀': { emoji: '🚀', fallback: '🚀', name: 'update' },
        '🎁': { emoji: '🎁', fallback: '🎁', name: 'gift' },
        '💰': { emoji: '💰', fallback: '💰', name: 'discount' },
        '❌': { emoji: '❌', fallback: '❌', name: 'error' }
    };

    // Kích thước icon
    const sizeClasses = {
        'small': 'icon-small',
        'medium': 'icon-medium',
        'large': 'icon-large',
        'xlarge': 'icon-xlarge'
    };

    const iconData = iconMap[icon] || iconMap['📢']; // Default fallback
    const sizeClass = sizeClasses[size] || sizeClasses['medium'];

    return (
        <span
            className={`icon-renderer ${sizeClass} ${className}`}
            title={iconData.name}
            role="img"
            aria-label={iconData.name}
        >
            {iconData.emoji}
        </span>
    );
};

export default IconRenderer;