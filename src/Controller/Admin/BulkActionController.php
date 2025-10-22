<?php

namespace Manuxi\SuluBulkActionsBundle\Controller\Admin;

use Manuxi\SuluBulkActionsBundle\Handler\BulkActionHandlerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class BulkActionController extends AbstractController
{
    public function __construct(
        private readonly BulkActionHandlerRegistry $handlerRegistry,
    ) {
    }

    #[Route('{resourceKey}/bulk-{action}', name: 'execute', methods: ['POST'])]
    public function execute(string $resourceKey, string $action, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $ids = $data['ids'] ?? [];

        if (empty($ids)) {
            return new JsonResponse(['error' => 'No IDs provided'], 400);
        }

        $result = $this->handlerRegistry->handle($resourceKey, $action, $ids, $request);

        if (null === $result) {
            return new JsonResponse(['error' => 'Action not handled'], 404);
        }

        return new JsonResponse([
            'success' => true,
            'count' => count($ids),
            'result' => $result,
        ]);
    }
}
