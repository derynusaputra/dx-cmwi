"use client";
import React, { useState } from 'react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import DatePicker from '@/components/form/date-picker';
import Radio from '@/components/form/input/Radio';
import Checkbox from '@/components/form/input/Checkbox';
import { ChevronDownIcon } from '@/icons';

export default function FormRequestPage() {
  const [plant, setPlant] = useState<string>("");
  const [emailKantor, setEmailKantor] = useState<string>("");
  const [emailSupervisor, setEmailSupervisor] = useState<string>("");
  const [emailManager, setEmailManager] = useState<string>("");
  
  const [tests, setTests] = useState<{ [key: string]: boolean }>({});
  const [tujuanAfterTest, setTujuanAfterTest] = useState<{ [key: string]: boolean }>({});
  
  const handleTestChange = (test: string, checked: boolean) => {
    setTests(prev => ({ ...prev, [test]: checked }));
  };

  const handleTujuanChange = (tujuan: string, checked: boolean) => {
    setTujuanAfterTest(prev => ({ ...prev, [tujuan]: checked }));
  };

  const deptOptions = [
    { value: "Quality Assurance", label: "Quality Assurance" },
    { value: "Quality Control", label: "Quality Control" },
    { value: "PPIC", label: "PPIC" },
    { value: "EPC", label: "EPC" },
    { value: "Engineering Casting", label: "Engineering Casting" },
    { value: "Other", label: "Other" },
  ];

  const emailKantorOptions = [
    { value: "user1@cmwi.co.id", label: "user1@cmwi.co.id" },
    { value: "user2@cmwi.co.id", label: "user2@cmwi.co.id" },
  ];

  const emailSpvOptions = [
    { value: "spv1@cmwi.co.id", label: "spv1@cmwi.co.id" },
    { value: "spv2@cmwi.co.id", label: "spv2@cmwi.co.id" },
  ];
  
  const emailMgrOptions = [
    { value: "mgr1@cmwi.co.id", label: "mgr1@cmwi.co.id" },
    { value: "mgr2@cmwi.co.id", label: "mgr2@cmwi.co.id" },
  ];

  const gradePaintingOptions = [
    { value: "PAR", label: "PAR" },
    { value: "PMS", label: "PMS" },
    { value: "PAR/PMS", label: "PAR/PMS" },
    { value: "Other", label: "Other" },
  ];

  const faseWheelOptions = [
    { value: "Development", label: "Development" },
    { value: "Mass Produksi", label: "Mass Produksi" },
    { value: "Trial", label: "Trial" },
    { value: "Other", label: "Other" },
  ];

  const kondisiProdukOptions = [
    { value: "Utuh", label: "Utuh" },
    { value: "Potongan", label: "Potongan" },
  ];

  const prosesTerakhirOptions = [
    { value: "After Machining", label: "After Machining" },
    { value: "After Painting", label: "After Painting" },
    { value: "After Casting", label: "After Casting" },
    { value: "After Heat Treatment", label: "After Heat Treatment" },
  ];
  
  const paintingLineOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "Tidak Ada", label: "Tidak Ada" },
  ];

  const urgensitasOptions = [
    { value: "Top Urgent", label: "Top Urgent" },
    { value: "Urgent", label: "Urgent" },
    { value: "Regular", label: "Regular" },
  ];

  const pengujianList = [
    "Impact Test",
    "Life Test",
    "Material Test",
    "Coating Check",
    "Hammen Cut",
    "SEM-EDS",
    "Dimension",
    "Contour",
    "Paint Ability",
    "Durability",
    "Appearance"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 flex items-start justify-center">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Form Request Pengujian
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Request pengujian dari divisi luar ke divisi QA (Produk Wheel)</p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* 1. Nama Plant */}
            <div className="md:col-span-2">
              <Label className="mb-3 block font-medium">1. Nama Plant <span className="text-error-500">*</span></Label>
              <div className="flex flex-wrap items-center gap-6">
                <Radio
                  id="plant-ho"
                  name="plant"
                  value="Head Office"
                  checked={plant === "Head Office"}
                  onChange={setPlant}
                  label="Head Office"
                />
                <Radio
                  id="plant-karawang"
                  name="plant"
                  value="Karawang Division"
                  checked={plant === "Karawang Division"}
                  onChange={setPlant}
                  label="Karawang Division"
                />
              </div>
            </div>

            {/* 2. Nama Department */}
            <div>
              <Label>2. Nama Department <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Select
                  options={deptOptions}
                  placeholder="Pilih department"
                  className="dark:bg-gray-900"
                  onChange={() => {}}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon/>
                </span>
              </div>
            </div>

            {/* 3. Nama Requester */}
            <div>
              <Label>3. Nama Requester <span className="text-error-500">*</span></Label>
              <Input 
                type="text" 
                placeholder="Nama lengkap" 
                pattern="[A-Za-z0-9\s]+" 
                title="Hanya huruf dan angka tanpa karakter spesial" 
              />
            </div>

            {/* 4. Email Kantor Requester */}
            <div>
              <Label className="mb-3 block font-medium">4. Email Kantor Requester <span className="text-error-500">*</span></Label>
              <div className="flex flex-col gap-3 mt-2">
                {emailKantorOptions.map(opt => (
                  <Radio
                    key={`email-kantor-${opt.value}`}
                    id={`email-kantor-${opt.value}`}
                    name="email-kantor"
                    value={opt.value}
                    checked={emailKantor === opt.value}
                    onChange={setEmailKantor}
                    label={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* 5. Email Supervisor Requester */}
            <div>
              <Label className="mb-3 block font-medium">5. Email Supervisor Requester <span className="text-error-500">*</span></Label>
              <div className="flex flex-col gap-3 mt-2">
                {emailSpvOptions.map(opt => (
                  <Radio
                    key={`email-spv-${opt.value}`}
                    id={`email-spv-${opt.value}`}
                    name="email-spv"
                    value={opt.value}
                    checked={emailSupervisor === opt.value}
                    onChange={setEmailSupervisor}
                    label={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* 6. Email Manager Requester */}
            <div className="md:col-span-2">
              <Label className="mb-3 block font-medium">6. Email Manager Requester <span className="text-error-500">*</span></Label>
              <div className="flex flex-col md:flex-row gap-6 mt-2">
                {emailMgrOptions.map(opt => (
                  <Radio
                    key={`email-mgr-${opt.value}`}
                    id={`email-mgr-${opt.value}`}
                    name="email-mgr"
                    value={opt.value}
                    checked={emailManager === opt.value}
                    onChange={setEmailManager}
                    label={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* 7. Tanggal Pengujian Job */}
            <div className="relative z-20">
              <DatePicker
                id="tanggal-pengujian"
                label="7. Tanggal Pengujian Job *"
                placeholder="Pilih tanggal"
                onChange={() => {}}
              />
            </div>
            
            {/* 8. Tanggal Permintaan Job Selesai */}
            <div className="relative z-10">
              <DatePicker
                id="tanggal-selesai"
                label="8. Tanggal Permintaan Job Selesai *"
                placeholder="Pilih target selesai"
                onChange={() => {}}
              />
            </div>

            {/* 9. Tipe Wheel */}
            <div>
              <Label>9. Tipe Wheel <span className="text-error-500">*</span></Label>
              <Input type="text" placeholder="Masukkan tipe wheel" />
            </div>

            {/* 10. Grade Painting */}
            <div>
              <Label>10. Grade Painting <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Select
                  options={gradePaintingOptions}
                  placeholder="Pilih grade painting"
                  className="dark:bg-gray-900"
                  onChange={() => {}}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon/>
                </span>
              </div>
            </div>

            {/* 11. Warna Painting */}
            <div>
              <Label>11. Warna Painting <span className="text-error-500">*</span></Label>
              <Input type="text" placeholder="Contoh: Silver, Black" />
            </div>

            {/* 12. Uraian Job */}
            <div className="md:col-span-2">
              <Label>12. Uraian Job <span className="text-error-500">*</span></Label>
              <textarea 
                rows={3}
                className="mt-2 w-full rounded-lg border appearance-none px-4 py-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                placeholder="Rincian mengenai job pengujian..."
              ></textarea>
            </div>

            {/* 13. Fase Wheel */}
            <div>
              <Label>13. Fase Wheel <span className="text-error-500">*</span></Label>
              <div className="relative mt-2">
                <Select
                  options={faseWheelOptions}
                  placeholder="Pilih fase"
                  className="dark:bg-gray-900"
                  onChange={() => {}}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon/>
                </span>
              </div>
            </div>

            {/* 14. Kondisi Produk */}
            <div>
              <Label>14. Kondisi Produk <span className="text-error-500">*</span></Label>
              <div className="relative mt-2">
                <Select
                  options={kondisiProdukOptions}
                  placeholder="Pilih kondisi"
                  className="dark:bg-gray-900"
                  onChange={() => {}}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon/>
                </span>
              </div>
            </div>

            {/* 15. Proses Terakhir */}
            <div>
              <Label>15. Proses Terakhir <span className="text-error-500">*</span></Label>
              <div className="relative mt-2">
                <Select
                  options={prosesTerakhirOptions}
                  placeholder="Pilih proses"
                  className="dark:bg-gray-900"
                  onChange={() => {}}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon/>
                </span>
              </div>
            </div>

            {/* 16. Nomor Cetakan */}
            <div>
              <Label>16. Nomor Cetakan</Label>
              <Input type="text" placeholder="Opsional" />
            </div>

            {/* 17. DP Casting */}
            <div>
              <Label>17. DP Casting</Label>
              <Input type="text" placeholder="Opsional" />
            </div>

            {/* 18. Shot Number */}
            <div>
              <Label>18. Shot Number</Label>
              <Input type="number" placeholder="Opsional (Angka)" />
            </div>

            {/* 19. Machining Line */}
            <div>
              <Label>19. Machining Line</Label>
              <Input type="number" placeholder="Opsional (Angka)" />
            </div>

            {/* 20. Painting Line */}
            <div>
              <Label>20. Painting Line <span className="text-error-500">*</span></Label>
              <div className="relative mt-2">
                <Select
                  options={paintingLineOptions}
                  placeholder="Pilih line"
                  className="dark:bg-gray-900"
                  onChange={() => {}}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon/>
                </span>
              </div>
            </div>

            {/* 21. Jumlah Disetor */}
            <div>
              <Label>21. Jumlah Disetor (pcs) <span className="text-error-500">*</span></Label>
              <Input type="number" placeholder="0" min="0" />
            </div>

            {/* 22. Tanggal Wheel Ready */}
            <div className="relative z-0">
              <DatePicker
                id="tanggal-wheel-ready"
                label="22. Tanggal Wheel Ready *"
                placeholder="Pilih tanggal"
                onChange={() => {}}
              />
            </div>

            {/* 23. Keperluan Barang Setelah Test */}
            <div className="md:col-span-2">
              <Label className="mb-3 block font-medium">23. Keperluan Barang Setelah Test <span className="text-error-500">*</span></Label>
              <div className="flex flex-wrap gap-6 mt-2">
                <Checkbox checked={!!tujuanAfterTest['Scrap QC']} id="keperluan-scrap-qc" onChange={(c) => handleTujuanChange('Scrap QC', c)} label="Scrap QC" />
                <Checkbox checked={!!tujuanAfterTest['Scrap Requester']} id="keperluan-scrap-req" onChange={(c) => handleTujuanChange('Scrap Requester', c)} label="Scrap Requester" />
                <Checkbox checked={!!tujuanAfterTest['Hold']} id="keperluan-hold" onChange={(c) => handleTujuanChange('Hold', c)} label="Hold" />
                <Checkbox checked={!!tujuanAfterTest['Other']} id="keperluan-other" onChange={(c) => handleTujuanChange('Other', c)} label="Other" />
              </div>
            </div>

            {/* 24. Urgensitas Job */}
            <div>
              <Label>24. Urgensitas Job <span className="text-error-500">*</span></Label>
              <div className="relative mt-2">
                <Select
                  options={urgensitasOptions}
                  placeholder="Pilih urgensitas"
                  className="dark:bg-gray-900"
                  onChange={() => {}}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon/>
                </span>
              </div>
            </div>

            {/* 25. Permintaan Pengujian */}
            <div className="md:col-span-2 pt-4">
              <Label className="mb-4 block font-medium">25. Permintaan Pengujian <span className="text-error-500">*</span></Label>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-4 font-medium text-gray-900 dark:text-white">Jenis Test</th>
                      <th className="py-3 px-4 font-medium text-gray-900 dark:text-white w-48">Jumlah Trial (pcs)</th>
                      <th className="py-3 px-4 font-medium text-gray-900 dark:text-white w-48">Jumlah Mass (pcs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengujianList.map((test, index) => (
                      <tr key={index} className="border-b last:border-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <Checkbox 
                            id={`test-${index}`} 
                            checked={!!tests[test]} 
                            onChange={(c) => handleTestChange(test, c)} 
                            label={test} 
                          />
                        </td>
                        <td className="py-2 px-4">
                          <Input 
                            type="number" 
                            placeholder="0" 
                            min="0" 
                          />
                        </td>
                        <td className="py-2 px-4">
                          <Input 
                            type="number" 
                            placeholder="0" 
                            min="0" 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 26. Keterangan */}
            <div className="md:col-span-2 pt-4">
              <Label>26. Keterangan</Label>
              <textarea 
                rows={4}
                className="mt-2 w-full rounded-lg border appearance-none px-4 py-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                placeholder="Tambahkan keterangan opsional..."
              ></textarea>
            </div>

          </div>

          <div className="pt-8 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-8">
            <button className="px-6 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98] transform">
              Batal
            </button>
            <button className="px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow focus:ring-4 focus:ring-brand-500/20 active:scale-[0.98] transform flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              Submit Form
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
