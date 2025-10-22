import React from 'react';
import { observable, action } from 'mobx';
import { translate } from 'sulu-admin-bundle/utils';
import { AbstractListToolbarAction } from 'sulu-admin-bundle/views';
import { Requester } from 'sulu-admin-bundle/services';
import { Dialog } from 'sulu-admin-bundle/components';

/**
 * Abstract base class for bulk actions in Sulu lists
 *
 * Usage:
 * class BulkPublishAction extends AbstractBulkAction {
 *     getActionName() { return 'publish'; }
 *     getIcon() { return 'su-eye'; }
 * }
 */
export default class AbstractBulkAction extends AbstractListToolbarAction {
    @observable showDialog = false;
    @observable loading = false;

    resourceKey = '';
    translationPrefix = '';

    constructor(listStore, listAdapterStore, router, options = {}) {
        super(listStore, listAdapterStore, router);

        if (options.resourceKey) {
            this.resourceKey = options.resourceKey;
        }
        if (options.translationPrefix) {
            this.translationPrefix = options.translationPrefix;
        }

        this.handleClick = this.handleClick.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.executeAction = this.executeAction.bind(this);
    }

    /**
     * Override: Return the action name (e.g., 'publish', 'unpublish', 'delete')
     */
    getActionName() {
        throw new Error('getActionName() must be implemented by subclass');
    }

    /**
     * Override: Return the icon name (e.g., 'su-eye', 'su-eye-slash')
     */
    getIcon() {
        return 'su-eye';
    }

    /**
     * Override: Return custom API endpoint if needed
     * Default: /admin/api/{resourceKey}/bulk-{action}
     */
    getApiEndpoint() {
        return `/admin/api/${this.resourceKey}/bulk-${this.getActionName()}`;
    }

    /**
     * Override: Return translation key suffix
     * Default: 'bulk_{action}'
     */
    getTranslationKey() {
        return `bulk.${this.getActionName()}`;
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

    @action
    handleClick() {
        this.showDialog = true;
    }

    @action
    handleConfirm() {
        this.showDialog = false;
        this.executeAction();
    }

    @action
    handleCancel() {
        this.showDialog = false;
    }

    @action
    executeAction() {
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