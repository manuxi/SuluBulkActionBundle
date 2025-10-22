import AbstractBulkAction from './AbstractBulkAction';

export default class BulkPublishAction extends AbstractBulkAction {

    resourceKey = 'testimonials';
    translationPrefix = 'sulu_testimonials';

    getActionName() {
        return 'publish';
    }

    getIcon() {
        return 'su-eye';
    }
}