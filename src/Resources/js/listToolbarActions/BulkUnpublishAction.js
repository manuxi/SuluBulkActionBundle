import AbstractBulkAction from './AbstractBulkAction';

export default class BulkUnpublishAction extends AbstractBulkAction {

    getActionName() {
        return 'unpublish';
    }

    getIcon() {
        return this.config.icon || 'su-hide';
    }
}