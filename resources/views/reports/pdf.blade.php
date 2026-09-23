<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            color: #0f172a;
            margin: 24px;
            font-size: 12px;
        }
        h1, h2, h3, p { margin: 0; }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: 700;
        }
        .subtitle {
            color: #475569;
            margin-top: 4px;
        }
        .pill {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            background: #0f172a;
            color: #e2e8f0;
            font-size: 11px;
            letter-spacing: .08em;
            text-transform: uppercase;
        }
        .grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }
        .grid td {
            border: 1px solid #cbd5e1;
            padding: 10px 12px;
            vertical-align: top;
        }
        .card-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: .08em;
        }
        .card-value {
            font-size: 18px;
            font-weight: 700;
            margin-top: 6px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 700;
            margin: 18px 0 10px;
        }
        table.data {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        table.data th, table.data td {
            border: 1px solid #cbd5e1;
            padding: 8px;
            text-align: left;
        }
        table.data th {
            background: #0f172a;
            color: white;
        }
        .muted {
            color: #64748b;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="title">TOKOTOKI Report</div>
            <div class="subtitle">{{ $periodLabel }} period report</div>
        </div>
        <div class="pill">{{ $report['range']['start'] }} - {{ $report['range']['end'] }}</div>
    </div>

    <table class="grid">
        <tr>
            @foreach ($report['summary'] as $card)
                <td>
                    <div class="card-label">{{ $card['label'] }}</div>
                    <div class="card-value">
                        @if (($card['format'] ?? 'number') === 'currency')
                            Rp {{ number_format((float) $card['value'], 0, ',', '.') }}
                        @else
                            {{ number_format((float) $card['value'], 0, ',', '.') }}
                        @endif
                    </div>
                    <div class="muted">{{ $card['note'] ?? '' }}</div>
                </td>
            @endforeach
        </tr>
    </table>

    <div class="section-title">Payment Method Statistics</div>
    <table class="data">
        <thead>
            <tr>
                <th>Method</th>
                <th>Count</th>
                <th>Revenue</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($report['payment_methods'] as $method)
                <tr>
                    <td>{{ $method['label'] }}</td>
                    <td>{{ number_format($method['count']) }}</td>
                    <td>Rp {{ number_format((float) $method['revenue'], 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="page-break"></div>

    <div class="section-title">Top Selling Products</div>
    <table class="data">
        <thead>
            <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Qty Sold</th>
                <th>Revenue</th>
                <th>Stock</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($report['top_products'] as $product)
                <tr>
                    <td>{{ $product['name'] }}</td>
                    <td>{{ $product['barcode'] }}</td>
                    <td>{{ number_format($product['quantity_sold']) }}</td>
                    <td>Rp {{ number_format((float) $product['revenue'], 0, ',', '.') }}</td>
                    <td>{{ $product['stock'] }} / {{ $product['min_stock'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Cashier Performance</div>
    <table class="data">
        <thead>
            <tr>
                <th>Cashier</th>
                <th>Transactions</th>
                <th>Completed</th>
                <th>Revenue</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($report['cashier_performance'] as $cashier)
                <tr>
                    <td>{{ $cashier['name'] }}</td>
                    <td>{{ number_format($cashier['transaction_count']) }}</td>
                    <td>{{ number_format($cashier['completed_count']) }}</td>
                    <td>Rp {{ number_format((float) $cashier['revenue'], 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Low Stock Alerts</div>
    <table class="data">
        <thead>
            <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Minimum</th>
                <th>Shortage</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($report['low_stock_alerts'] as $product)
                <tr>
                    <td>{{ $product['name'] }}</td>
                    <td>{{ $product['stock'] }}</td>
                    <td>{{ $product['min_stock'] }}</td>
                    <td>{{ $product['shortage'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
