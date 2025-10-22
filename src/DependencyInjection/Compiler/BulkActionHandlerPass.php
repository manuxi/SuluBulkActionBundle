<?php

namespace Manuxi\SuluBulkActionsBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class BulkActionHandlerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if (!$container->has('sulu_bulk_actions.handler_registry')) {
            return;
        }

        $registry = $container->findDefinition('sulu_bulk_actions.handler_registry');
        $handlers = $container->findTaggedServiceIds('sulu_bulk_actions.handler');

        foreach ($handlers as $id => $tags) {
            $registry->addMethodCall('addHandler', [new Reference($id)]);
        }
    }
}