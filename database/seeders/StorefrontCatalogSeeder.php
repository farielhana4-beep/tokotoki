<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class StorefrontCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['barcode' => '8999000001001', 'name' => 'Vas Anyaman Bambu', 'category' => 'Dekorasi', 'description' => 'Vas dekoratif dari anyaman bambu karya perajin lokal.', 'purchase_price' => 45000, 'selling_price' => 75000, 'stock' => 18, 'min_stock' => 4, 'status' => 'active'],
            ['barcode' => '8999000001002', 'name' => 'Hiasan Dinding Makrame', 'category' => 'Dekorasi', 'description' => 'Hiasan dinding makrame buatan tangan untuk sudut rumah yang hangat.', 'purchase_price' => 70000, 'selling_price' => 115000, 'stock' => 12, 'min_stock' => 3, 'status' => 'active'],
            ['barcode' => '8999000001003', 'name' => 'Gelang Manik Nusantara', 'category' => 'Aksesoris', 'description' => 'Gelang manik warna-warni dengan sentuhan motif Nusantara.', 'purchase_price' => 18000, 'selling_price' => 32000, 'stock' => 30, 'min_stock' => 6, 'status' => 'active'],
            ['barcode' => '8999000001004', 'name' => 'Tas Selempang Tenun', 'category' => 'Aksesoris', 'description' => 'Tas selempang tenun untuk melengkapi aktivitas sehari-hari.', 'purchase_price' => 95000, 'selling_price' => 155000, 'stock' => 10, 'min_stock' => 2, 'status' => 'active'],
            ['barcode' => '8999000001005', 'name' => 'Tempat Tisu Rotan', 'category' => 'Perlengkapan Rumah', 'description' => 'Tempat tisu rotan yang dirajut rapi untuk meja keluarga.', 'purchase_price' => 35000, 'selling_price' => 60000, 'stock' => 20, 'min_stock' => 4, 'status' => 'active'],
            ['barcode' => '8999000001006', 'name' => 'Alas Gelas Kayu', 'category' => 'Perlengkapan Rumah', 'description' => 'Set alas gelas kayu bertekstur alami hasil kerajinan tangan.', 'purchase_price' => 28000, 'selling_price' => 48000, 'stock' => 24, 'min_stock' => 5, 'status' => 'active'],
            ['barcode' => '8999000001007', 'name' => 'Gantungan Kunci Batik', 'category' => 'Souvenir', 'description' => 'Gantungan kunci bermotif batik sebagai buah tangan khas Nusantara.', 'purchase_price' => 10000, 'selling_price' => 20000, 'stock' => 40, 'min_stock' => 8, 'status' => 'active'],
            ['barcode' => '8999000001008', 'name' => 'Miniatur Rumah Adat', 'category' => 'Souvenir', 'description' => 'Miniatur rumah adat yang dibuat teliti oleh perajin lokal.', 'purchase_price' => 55000, 'selling_price' => 90000, 'stock' => 14, 'min_stock' => 3, 'status' => 'active'],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(['barcode' => $product['barcode']], $product);
        }
    }
}
