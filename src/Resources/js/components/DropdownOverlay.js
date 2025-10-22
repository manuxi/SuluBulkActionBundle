import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import Icon from 'sulu-admin-bundle/components/Icon';

@observer
class DropdownOverlay extends React.Component {
    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        document.addEventListener('keydown', this.handleEscape);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        document.removeEventListener('keydown', this.handleEscape);
    }

    handleClickOutside = (e) => {
        const dropdown = document.getElementById('composite-dropdown-portal');
        if (dropdown && !dropdown.contains(e.target)) {
            this.props.onClose();
        }
    };

    handleEscape = (e) => {
        if (e.key === 'Escape') {
            this.props.onClose();
        }
    };

    render() {
        const { items, onClose } = this.props;

        // Search Action-Button
        const toolbarButtons = document.querySelectorAll('button, .button');
        let buttonRect = null;

        for (const btn of toolbarButtons) {
            const text = btn.textContent || '';
            if (text.includes('Aktionen') || text.includes('Actions')) {
                buttonRect = btn.getBoundingClientRect();
                break;
            }
        }

        if (!buttonRect) {
            buttonRect = {
                bottom: 60,
                left: window.innerWidth - 250,
            };
        }

        const top = buttonRect.bottom;
        const left = buttonRect.left;

        return ReactDOM.createPortal(
            <div
                id="composite-dropdown-portal"
                style={{
                    position: 'fixed',
                    top: `${top}px`,
                    left: `${left}px`,
                    minWidth: '200px',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '0',
                    boxShadow: '2px 6px 12px 0 hsla(0, 0%, 80%, .5)',
                    zIndex: 99999,
                    overflow: 'hidden',
                }}
            >
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => {
                            if (!item.disabled && item.onClick) {
                                item.onClick();
                                onClose();
                            }
                        }}
                        disabled={item.disabled}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            gap: '8px',
                            padding: '11px 16px',
                            background: '#fafafa',
                            border: 'none',
                            textAlign: 'left',
                            cursor: item.disabled ? 'not-allowed' : 'pointer',
                            color: item.disabled ? '#ccc' : '#000',
                            fontSize: '12px',
                        }}
                        onMouseEnter={(e) => {
                            if (!item.disabled) {
                                /*e.currentTarget.style.background = '#ffffff';*/
                                e.currentTarget.style.color = '#52b6ca';
                            }
                        }}
                        onMouseLeave={(e) => {
                            /*e.currentTarget.style.background = '#fafafa';*/
                            e.currentTarget.style.color = item.disabled ? '#ccc' : '#000';
                        }}
                    >
                        {item.icon && <Icon name={item.icon} />}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>,
            document.body
        );
    }
}

export default DropdownOverlay;