<?php

namespace App\Http\Controllers;

use App\Enums\ReportPeriod;
use App\Services\Report\ReportExportService;
use App\Services\Report\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request, ReportService $reportService): Response
    {
        $period = ReportPeriod::fromRequest($request->string('period')->toString());
        $report = $reportService->buildReport($period);

        return Inertia::render('Reports/Index', [
            'periods' => array_map(
                fn (ReportPeriod $item) => [
                    'value' => $item->value,
                    'label' => $item->label(),
                ],
                ReportPeriod::cases(),
            ),
            'selectedPeriod' => $period->value,
            'report' => $report,
            'exports' => [
                'pdf' => route('admin.reports.export.pdf', ['period' => $period->value]),
                'excel' => route('admin.reports.export.excel', ['period' => $period->value]),
            ],
        ]);
    }

    public function exportPdf(Request $request, ReportService $reportService, ReportExportService $exportService)
    {
        $period = ReportPeriod::fromRequest($request->string('period')->toString());
        $report = $reportService->exportDataset($period);

        return $exportService->downloadPdf($report, $period);
    }

    public function exportExcel(Request $request, ReportService $reportService, ReportExportService $exportService)
    {
        $period = ReportPeriod::fromRequest($request->string('period')->toString());
        $report = $reportService->exportDataset($period);

        return $exportService->downloadExcel($report, $period);
    }
}
