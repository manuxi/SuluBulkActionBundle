import React from 'react';
import { observable, action } from 'mobx';
import { translate } from 'sulu-admin-bundle/utils';
import { AbstractListToolbarAction } from 'sulu-admin-bundle/views';
import { Requester } from 'sulu-admin-bundle/services';
import { Dialog } from 'sulu-admin-bundle/components';

export default class AbstractBulkAction extends AbstractListToolbarAction {
    @observable showDialog = false;
    @observable loading = false;

    resourceKey = '';
    translationPrefix = 'sulu_bulk_actions';
    config = {};

    constructor(listStore, listAdapterStore, router, locales, resourceStore, options = {}) {
        super(listStore, listAdapterStore, router);

        this.resourceKey = this.listStore.resourceKey;

        if (options.config) {
            this.config = options.config;
        }

        this.handleClick = this.handleClick.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.executeAction = this.executeAction.bind(this);
    }

    getActionName() {
        throw new Error('getActionName() must be implemented by subclass');
    }

    getIcon() {
        return 'su-eye'; // Default
    }

    getApiEndpoint() {
        return `/admin/api/${this.resourceKey}/bulk-${this.getActionName()}`;
    }

    getTranslationKey() {
        return `${this.getActionName()}`;
    }

    getToolbarItemConfig() {
        const disabled = this.listStore.selections.length === 0;

        return {
            type: 'button',
            label: translate(`${this.translationPrefix}.${this.getTranslationKey()}`),
            disabled: disabled,
            onClick: this.handleClick,
            icon: this.getIcon(),
            loading: this.loading,
        };
    }

    @action handleClick() {
        this.showDialog = true;
    }

    @action handleConfirm() {
        this.showDialog = false;
        this.executeAction();
    }

    @action handleCancel() {
        this.showDialog = false;
    }

    @action executeAction() {
        this.loading = true;

        const ids = this.listStore.selections.map(item => item.id);
        const locale = this.router.attributes.locale;

        Requester.post(`${this.getApiEndpoint()}?locale=${locale}`, {
            ids: ids,
            locale: locale
        })
            .then(() => {
                this.listStore.clearSelection();
                this.listStore.reload();

                console.log(translate(`${this.translationPrefix}.${this.getTranslationKey()}_success`, {
                    count: ids.length
                }));
            })
            .catch((error) => {
                console.error(`Bulk ${this.getActionName()} Error:`, error);
                alert(translate(`${this.translationPrefix}.${this.getTranslationKey()}_error`));
            })
            .finally(action(() => {
                this.loading = false;
            }));
    }

    getNode(index) {
        if (!this.showDialog) {
            return null;
        }

        return (
            <Dialog
                cancelText={translate('sulu_admin.cancel')}
                confirmText={translate('sulu_admin.ok')}
                key={`bulk-${this.getActionName()}-dialog-${index}`}
                onCancel={this.handleCancel}
                onConfirm={this.handleConfirm}
                open={this.showDialog}
                title={translate(`${this.translationPrefix}.${this.getTranslationKey()}_confirm_title`)}
            >
                {translate(`${this.translationPrefix}.${this.getTranslationKey()}_confirm_text`, {
                    count: this.listStore.selections.length
                })}
            </Dialog>
        );
    }

    destroy() {
        // Cleanup
    }
}