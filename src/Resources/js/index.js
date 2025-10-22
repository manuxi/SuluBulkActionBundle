import {listToolbarActionRegistry} from 'sulu-admin-bundle/views';
import ListDropdownToolbarAction from './listToolbarActions/ListDropdownToolbarAction';
import BulkPublishAction from './listToolbarActions/BulkPublishAction';
import BulkUnpublishAction from './listToolbarActions/BulkUnpublishAction';

listToolbarActionRegistry.add('app.bulk.actions_dropdown', ListDropdownToolbarAction);
listToolbarActionRegistry.add('app.bulk.publish', BulkPublishAction);
listToolbarActionRegistry.add('app.bulk.unpublish', BulkUnpublishAction);

import BulkActionsInitializer from './services/BulkActionsInitializer';

const adminConfigs = window.suluAdminConfig || {};

Object.entries(adminConfigs).forEach(([key, config]) => {
    if (config.bulkActions) {
        BulkActionsInitializer.init(config);
    }
});