<?php

namespace Manuxi\SuluBulkActionsBundle\Handler;

use Symfony\Component\HttpFoundation\Request;

class BulkActionHandlerRegistry
{
    private array $handlers = [];

    public function addHandler(object $handler): void
    {
        $this->handlers[] = $handler;
    }

    public function handle(string $resourceKey, string $action, array $ids, Request $request): ?array
    {
        foreach ($this->handlers as $handler) {
            if (method_exists($handler, 'supports')
                && $handler->supports($resourceKey, $action)) {
                return $handler->handle($action, $ids, $request);
            }
        }

        return null;
    }
}
