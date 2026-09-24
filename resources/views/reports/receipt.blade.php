<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Struk {{ $receipt['invoice_number'] }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #111; padding: 12px 10px; }
        .center { text-align: center; }
        .store { font-size: 16px; font-weight: bold; }
        .meta { font-size: 10px; color: #444; margin-top: 2px; }
        .sep { border-top: 1px dashed #888; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { vertical-align: top; padding: 2px 0; font-size: 11px; }
        .right { text-align: right; }
        .total { font-size: 13px; font-weight: bold; }
        .footer { margin-top: 10px; text-align: center; font-size: 10px; color: #444; }
    </style>
</head>
<body>
    <div class="center">
        <div class="store">{{ $receipt['store_name'] }}</div>
        <div class="meta">{{ $receipt['invoice_number'] }}</div>
        <div class="meta">{{ $receipt['created_at'] }}</div>
    </div>

    <div class="sep"></div>

    <table>
        @if($receipt['cashier_name'])
            <tr><td>Kasir</td><td class="right">{{ $receipt['cashier_name'] }}</td></tr>
        @endif
        @if($receipt['customer_name'])
            <tr><td>Pembeli</td><td class="right">{{ $receipt['customer_name'] }}</td></tr>
        @endif
        @if($receipt['customer_phone'])
            <tr><td>Telepon</td><td class="right">{{ $receipt['customer_phone'] }}</td></tr>
        @endif
        <tr><td>Bayar</td><td class="right">{{ strtoupper($receipt['payment_method']) }}</td></tr>
        <tr><td>Status</td><td class="right">{{ strtoupper($receipt['payment_status']) }}</td></tr>
    </table>

    <div class="sep"></div>

    <table>
        @foreach($receipt['items'] as $item)
            <tr>
                <td>{{ $item['name'] }}<br><span style="font-size:10px;color:#444;">{{ $item['quantity'] }} x {{ number_format($item['price'], 0, ',', '.') }}</span></td>
                <td class="right">{{ number_format($item['subtotal'], 0, ',', '.') }}</td>
            </tr>
        @endforeach
    </table>

    <div class="sep"></div>

    <table>
        <tr><td>Subtotal</td><td class="right">{{ number_format($receipt['subtotal'], 0, ',', '.') }}</td></tr>
        <tr><td>PPN 11%</td><td class="right">{{ number_format($receipt['tax'], 0, ',', '.') }}</td></tr>
        @if($receipt['discount'] > 0)
            <tr><td>Diskon</td><td class="right">-{{ number_format($receipt['discount'], 0, ',', '.') }}</td></tr>
        @endif
        <tr><td class="total">TOTAL</td><td class="right total">Rp{{ number_format($receipt['total'], 0, ',', '.') }}</td></tr>
        @if($receipt['payment_method'] === 'transfer' && $receipt['bank_number'])
            <tr><td>Rekening</td><td class="right">{{ $receipt['bank_name'] }} {{ $receipt['bank_number'] }}</td></tr>
            @if($receipt['bank_holder'])
                <tr><td>A.n.</td><td class="right">{{ $receipt['bank_holder'] }}</td></tr>
            @endif
        @endif
        @if($receipt['cash_received'] !== null)
            <tr><td>Tunai</td><td class="right">{{ number_format($receipt['cash_received'], 0, ',', '.') }}</td></tr>
            <tr><td>Kembali</td><td class="right">{{ number_format($receipt['change'], 0, ',', '.') }}</td></tr>
        @endif
    </table>

    <div class="footer">{{ $receipt['footer_text'] }}</div>
</body>
</html>
