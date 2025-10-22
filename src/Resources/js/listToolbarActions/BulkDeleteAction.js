import AbstractBulkAction from './AbstractBulkAction';

export default class BulkPublishAction extends AbstractBulkAction {

    getActionName() {
        return 'publish';
    }

    getIcon() {
        return this.config.icon || 'su-eye';
    }
}