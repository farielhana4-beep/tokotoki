<?php

namespace App\Services\Report;

use App\Enums\ReportPeriod;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportService
{
    public function downloadPdf(array $report, ReportPeriod $period): StreamedResponse
    {
        $pdf = Pdf::loadView('reports.pdf', [
            'report' => $report,
            'periodLabel' => $period->label(),
        ])->setPaper('a4', 'landscape');

        $filename = sprintf('tokotoki-report-%s.pdf', $period->value);

        return response()->streamDownload(
            fn () => print($pdf->output()),
            $filename,
            [
                'Content-Type' => 'application/pdf',
            ],
        );
    }

    public function downloadExcel(array $report, ReportPeriod $period): BinaryFileResponse
    {
        $spreadsheet = new Spreadsheet();
        $this->buildSummarySheet($spreadsheet, $report, $period);
        $this->buildTopProductsSheet($spreadsheet, $report);
        $this->buildCashierSheet($spreadsheet, $report);

        $filename = storage_path(sprintf(
            'app/reports/tokotoki-report-%s-%s.xlsx',
            $period->value,
            now()->format('Ymd_His'),
        ));

        if (! is_dir(dirname($filename))) {
            mkdir(dirname($filename), 0755, true);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save($filename);

        return response()->download($filename)->deleteFileAfterSend(true);
    }

    private function buildSummarySheet(Spreadsheet $spreadsheet, array $report, ReportPeriod $period): void
    {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Summary');

        $sheet->setCellValue('A1', 'TOKOTOKI Report');
        $sheet->setCellValue('A2', sprintf('%s Period Report', $period->label()));
        $sheet->setCellValue('A3', 'Range');
        $sheet->setCellValue('B3', $report['range']['start'].' - '.$report['range']['end']);

        $row = 5;
        foreach ($report['summary'] as $card) {
            $sheet->setCellValue('A'.$row, $card['label']);
            $sheet->setCellValue('B'.$row, $card['value']);
            $sheet->setCellValue('C'.$row, $card['note'] ?? '');
            $row++;
        }

        $sheet->setCellValue('E5', 'Payment Method');
        $sheet->setCellValue('F5', 'Count');
        $sheet->setCellValue('G5', 'Revenue');
        $row = 6;
        foreach ($report['payment_methods'] as $method) {
            $sheet->setCellValue('E'.$row, $method['label']);
            $sheet->setCellValue('F'.$row, $method['count']);
            $sheet->setCellValue('G'.$row, $method['revenue']);
            $row++;
        }

        $sheet->getStyle('A1:G5')->getFont()->setBold(true);
        $sheet->getStyle('A1:G20')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('A1:G20')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        foreach (['A', 'B', 'C', 'E', 'F', 'G'] as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    private function buildTopProductsSheet(Spreadsheet $spreadsheet, array $report): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Top Products');
        $headers = ['Product', 'Barcode', 'Qty Sold', 'Revenue', 'Stock', 'Min Stock'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValue($this->columnLetter($index + 1).'1', $header);
        }

        $row = 2;
        foreach ($report['top_products'] as $product) {
            $sheet->setCellValue("A{$row}", $product['name']);
            $sheet->setCellValue("B{$row}", $product['barcode']);
            $sheet->setCellValue("C{$row}", $product['quantity_sold']);
            $sheet->setCellValue("D{$row}", $product['revenue']);
            $sheet->setCellValue("E{$row}", $product['stock']);
            $sheet->setCellValue("F{$row}", $product['min_stock']);
            $row++;
        }

        $sheet->getStyle('A1:F1')->getFont()->setBold(true);
        $sheet->getStyle('A1:F20')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        foreach (range('A', 'F') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    private function buildCashierSheet(Spreadsheet $spreadsheet, array $report): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Cashiers');
        $headers = ['Cashier', 'Transactions', 'Completed', 'Revenue'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValue($this->columnLetter($index + 1).'1', $header);
        }

        $row = 2;
        foreach ($report['cashier_performance'] as $cashier) {
            $sheet->setCellValue("A{$row}", $cashier['name']);
            $sheet->setCellValue("B{$row}", $cashier['transaction_count']);
            $sheet->setCellValue("C{$row}", $cashier['completed_count']);
            $sheet->setCellValue("D{$row}", $cashier['revenue']);
            $row++;
        }

        $sheet->getStyle('A1:D1')->getFont()->setBold(true);
        $sheet->getStyle('A1:D20')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        foreach (range('A', 'D') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    private function columnLetter(int $index): string
    {
        return Coordinate::stringFromColumnIndex($index);
    }
}
