<?php

declare(strict_types=1);

namespace Manuxi\SuluBulkActionsBundle;

use Manuxi\SuluBulkActionsBundle\DependencyInjection\Compiler\BulkActionHandlerPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class SuluBulkActionsBundle extends Bundle
{
    public function build(ContainerBuilder $container): void
    {
        parent::build($container);
        $container->addCompilerPass(new BulkActionHandlerPass());
    }
}
