import React from 'react';
import { observable, action } from 'mobx';
import AbstractListToolbarAction from 'sulu-admin-bundle/views/List/toolbarActions/AbstractListToolbarAction';
import DropdownOverlay from '../components/DropdownOverlay';
import { ArrowMenu, Button, Icon, Toolbar } from 'sulu-admin-bundle/components';
import { translate } from 'sulu-admin-bundle/utils';

function normalizeActions(options) {
    const raw = options?.actions || [];
    const result = [];

    if (!Array.isArray(raw)) {
        return result;
    }

    for (let i = 0; i < raw.length; i++) {
        const entry = raw[i];

        if (typeof entry === 'string') {
            result.push({ key: entry, options: {} });
        } else if (Array.isArray(entry) && typeof entry[0] === 'string') {
            result.push({ key: entry[0], options: entry[1] || {} });
        } else if (typeof entry === 'object' && entry !== null && typeof entry.key === 'string') {
            result.push({ key: entry.key, options: entry.options || {} });
        } else if (typeof entry === 'object' && entry !== null && typeof entry.type === 'string') {
            result.push({ key: entry.type, options: entry.options || {} });
        }
    }

    return result;
}

export default class CompositeListDropdownToolbarAction extends AbstractListToolbarAction {
    @observable childActions = [];
    @observable initialized = false;
    @observable isOpen = false;
    _dropdownItems = [];
    buttonRef = null;

    constructor(listStore, listAdapterStore, router, locales, resourceStore, options) {
        super(listStore, listAdapterStore, router, locales, resourceStore, options);

        const opts = options || {};
        this.label = opts.label || 'Actions';
        this.icon = opts.icon || 'su-more';
        this.disableForEmptySelection = !!opts.disable_for_empty_selection;
        this.actionsConfig = normalizeActions(opts);
    }

    @action
    initializeChildActions() {
        if (this.initialized) {
            return;
        }

        // LAZY IMPORT
        const suluViews = require('sulu-admin-bundle/views');
        const listToolbarActionRegistry = suluViews.listToolbarActionRegistry;

        for (const def of this.actionsConfig) {
            if (!def || !def.key) continue;

            if (!(def.key in listToolbarActionRegistry.toolbarActions)) {
                continue;
            }

            const ActionClass = listToolbarActionRegistry.get(def.key);

            try {
                const child = new ActionClass(
                    this.listStore,
                    this.listAdapterStore,
                    this.router,
                    this.locales,
                    this.resourceStore,
                    def.options || {}
                );

                this.childActions.push({ child, def });
            } catch (e) {
                console.error(e.stack);
            }
        }

        this.initialized = true;
    }

    getToolbarItemConfig() {
        if (!this.initialized) {
            this.initializeChildActions();
        }

        const hasSelection = this.listStore.selections.length > 0;
        const dropdownDisabled = this.disableForEmptySelection && !hasSelection;

        const items = [];

        for (const { child, def } of this.childActions) {
            if (!child || typeof child.getToolbarItemConfig !== 'function') {
                console.warn('[CompositeListDropdownToolbarAction] Child has no getToolbarItemConfig:', def.key);
                continue;
            }

            try {
                const cfg = child.getToolbarItemConfig();

                if (!cfg) {
                    console.warn('[CompositeListDropdownToolbarAction] Child config is null:', def.key);
                    continue;
                }

                if (cfg.type !== 'button' || typeof cfg.onClick !== 'function') {
                    console.warn('[CompositeListDropdownToolbarAction] Child is not a button:', def.key, cfg);
                    continue;
                }

                items.push({
                    label: cfg.label || def.key,
                    icon: cfg.icon,
                    disabled: !!cfg.disabled,
                    onClick: cfg.onClick,
                });

            } catch (e) {
                console.error('[CompositeListDropdownToolbarAction] Error @ getToolbarItemConfig:', def.key, e);
            }
        }

        if (items.length === 0) {
            console.warn('[CompositeListDropdownToolbarAction] No items available!');
            return null;
        }

        this._dropdownItems = items;

        // config
        return {
            type: 'button',
            label: (
                <React.Fragment>
                    {translate(this.label)} {}
                    &nbsp;
                    <Icon name="su-angle-down" /> {}
                </React.Fragment>
            ),
            icon: this.icon,
            disabled: dropdownDisabled,
            onClick: action(() => {
                this.isOpen = !this.isOpen;
            }),
            class: this.isOpen ? 'active' : '',
            value: this.isOpen ? 'active' : undefined,
        };

    }

    getNode(index) {
        if (!this.initialized) {
            this.initializeChildActions();
        }

        const hasSelection = this.listStore.selections.length > 0;
        const dropdownDisabled = this.disableForEmptySelection && !hasSelection;

        return (
            <React.Fragment key={`composite-dropdown-${index}`}>
                {/* Render Child-Dialogue (e.g. confirm-Dialogue) */}
                {this.childActions.map((item, i) => {
                    if (item.child && typeof item.child.getNode === 'function') {
                        return item.child.getNode(`${index}-${i}`);
                    }
                    return null;
                })}

                {/* Render Dropdown-Overlay if opened */}
                {this.isOpen && (
                    <DropdownOverlay
                        items={this._dropdownItems}
                        disabled={dropdownDisabled}
                        onClose={action(() => { this.isOpen = false; })}
                    />
                )}
            </React.Fragment>
        );
    }

    destroy() {
        for (const { child } of this.childActions) {
            if (child && typeof child.destroy === 'function') {
                child.destroy();
            }
        }
    }
}