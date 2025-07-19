import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import './CustomScrollbars.scss';

class CustomScrollbars extends Component {
    ref = React.createRef();

    getScrollLeft = () => this.ref.current?.getScrollLeft() || 0;
    getScrollTop = () => this.ref.current?.getScrollTop() || 0;

    scrollToBottom = () => {
        if (!this.ref.current) return;
        this.ref.current.scrollTop(this.ref.current.getScrollHeight());
    };

    scrollTo = (targetTop) => {
        if (!this.ref.current) return;
        this.ref.current.scrollTop(targetTop);
    };

    renderTrackHorizontal = ({ style, ...props }) => (
        <div {...props} className="track-horizontal" style={{ ...style, display: 'none' }} />
    );

    renderTrackVertical = ({ style, ...props }) => (
        <div {...props} className="track-vertical" style={{ ...style }} />
    );

    renderThumbHorizontal = ({ style, ...props }) => (
        <div {...props} className="thumb-horizontal" style={{ ...style, display: 'none' }} />
    );

    renderThumbVertical = ({ style, ...props }) => (
        <div {...props} className="thumb-vertical" style={{ ...style }} />
    );

    renderNone = () => <div />;

    render() {
        const { className, disableVerticalScroll, disableHorizontalScroll, children, style, ...otherProps } = this.props;
        return (
            <Scrollbars
                ref={this.ref}
                autoHide
                autoHideTimeout={200}
                hideTracksWhenNotNeeded
                className={className ? `${className} custom-scrollbar` : 'custom-scrollbar'}
                style={{ ...style, touchAction: 'pan-y' }}
                {...otherProps}
                renderTrackHorizontal={disableHorizontalScroll ? this.renderNone : this.renderTrackHorizontal}
                renderTrackVertical={disableVerticalScroll ? this.renderNone : this.renderTrackVertical}
                renderThumbHorizontal={disableHorizontalScroll ? this.renderNone : this.renderThumbHorizontal}
                renderThumbVertical={disableVerticalScroll ? this.renderNone : this.renderThumbVertical}
            >
                {children}
            </Scrollbars>
        );
    }
}

export default CustomScrollbars;