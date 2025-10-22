import BulkPublishAction from '../listToolbarActions/BulkPublishAction';
import BulkUnpublishAction from '../listToolbarActions/BulkUnpublishAction';
import BulkDeleteAction from '../listToolbarActions/BulkDeleteAction';

const ACTION_MAP = {
    'publish': BulkPublishAction,
    'unpublish': BulkUnpublishAction,
    'delete': BulkDeleteAction,
};

export default class BulkActionsInitializer {

    // Gib nur die Action-Definitionen zurück, keine Instanzen!
    static getActionDefinitions(adminConfig) {
        const { bulkActions } = adminConfig;

        if (!bulkActions) {
            return [];
        }

        return Object.entries(bulkActions).map(([actionName, actionConfig]) => ({
            name: actionName,
            config: actionConfig,
            ActionClass: ACTION_MAP[actionName]
        }));
    }
}