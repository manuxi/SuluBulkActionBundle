import AbstractBulkAction from './AbstractBulkAction';

export default class BulkUnpublishAction extends AbstractBulkAction {

    resourceKey = 'testimonials';
    translationPrefix = 'sulu_testimonials';

    getActionName() {
        return 'unpublish';
    }

    getIcon() {
        return 'su-hide';
    }
}