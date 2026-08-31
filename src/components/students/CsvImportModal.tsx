import React, { useState, useRef } from 'react';
import { X, FileSpreadsheet, Upload, Download, CheckCircle2, XCircle } from 'lucide-react';
import { ClassSection } from '../../types';
import { api } from '../../services/api';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  classes: ClassSection[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  classes,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedCsvRows, setParsedCsvRows] = useState<Array<any>>([]);
  const [csvImportError, setCsvImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParseCsv = (raw: string) => {
    setCsvText(raw);
    setCsvImportError('');
    if (!raw.trim()) {
      setParsedCsvRows([]);
      return;
    }

    try {
      const lines = raw.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setCsvImportError('CSV must have a header row and at least 1 data row.');
        setParsedCsvRows([]);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h.includes('name'));
      const gradeIdx = headers.findIndex((h) => h.includes('grade'));
      const sectionIdx = headers.findIndex((h) => h.includes('section'));
      const genderIdx = headers.findIndex((h) => h.includes('gender'));
      const rollIdx = headers.findIndex((h) => h.includes('roll'));
      const guardianIdx = headers.findIndex((h) => h.includes('guardian') || h.includes('parent'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('contact'));
      const emailIdx = headers.findIndex((h) => h.includes('email'));
      const addressIdx = headers.findIndex((h) => h.includes('address'));
      const bloodIdx = headers.findIndex((h) => h.includes('blood'));

      if (nameIdx === -1) {
        setCsvImportError('CSV must include a "Name" column.');
        return;
      }

      const parsed: Array<any> = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        const name = cols[nameIdx];
        if (!name) continue;

        const grade = gradeIdx !== -1 && cols[gradeIdx] ? cols[gradeIdx] : '10';
        let sectionId = classes[0]?.id || 'cls-10a';
        if (sectionIdx !== -1 && cols[sectionIdx]) {
          const matchedCls = classes.find(
            (c) =>
              c.id.toLowerCase() === cols[sectionIdx].toLowerCase() ||
              c.name.toLowerCase().includes(cols[sectionIdx].toLowerCase()) ||
              c.section.toLowerCase() === cols[sectionIdx].toLowerCase()
          );
          if (matchedCls) sectionId = matchedCls.id;
        }

        parsed.push({
          name,
          email: emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : `${name.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
          grade,
          sectionId,
          gender: (genderIdx !== -1 && (cols[genderIdx] === 'Female' || cols[genderIdx] === 'Male' ? cols[genderIdx] : 'Male')) as any,
          rollNumber: rollIdx !== -1 && cols[rollIdx] ? cols[rollIdx] : `${grade}A-${Math.floor(Math.random() * 80 + 10)}`,
          guardianName: guardianIdx !== -1 && cols[guardianIdx] ? cols[guardianIdx] : 'Guardian',
          guardianPhone: phoneIdx !== -1 && cols[phoneIdx] ? cols[phoneIdx] : '+1 (555) 000-0000',
          guardianEmail: emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : 'guardian@mail.com',
          address: addressIdx !== -1 && cols[addressIdx] ? cols[addressIdx] : 'Springfield',
          bloodGroup: bloodIdx !== -1 && cols[bloodIdx] ? cols[bloodIdx] : 'O+',
          status: 'Active',
        });
      }

      setParsedCsvRows(parsed);
      if (parsed.length === 0) {
        setCsvImportError('No valid rows found in CSV.');
      }
    } catch (err: any) {
      setCsvImportError(`Failed to parse CSV: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParseCsv(content);
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const sample = `Name,Grade,Section,Gender,GuardianName,GuardianPhone,GuardianEmail,Address,BloodGroup
Ethan Walker,10,cls-10a,Male,Thomas Walker,+1 (555) 345-6711,thomas.w@gmail.com,12 Maple St,O+
Chloe Bennett,10,cls-10b,Female,Margaret Bennett,+1 (555) 345-6722,m.bennett@gmail.com,45 Oak Ave,A+
Lucas Vance,9,cls-9a,Male,Rebecca Vance,+1 (555) 345-6733,r.vance@gmail.com,78 Pine Rd,B+`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteCsvImport = async () => {
    if (parsedCsvRows.length === 0) return;
    setIsImporting(true);
    try {
      await api.createStudentsBulk(parsedCsvRows);
      onClose();
      setParsedCsvRows([]);
      setCsvText('');
      onImportComplete();
    } catch (err: any) {
      setCsvImportError(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Import Students from CSV</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={handleDownloadSampleCsv}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV File</span>
            </button>
          </div>

          <textarea
            value={csvText}
            onChange={(e) => handleParseCsv(e.target.value)}
            placeholder="Paste CSV content here..."
            className="w-full h-32 p-3 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />

          {csvImportError && (
            <div className="flex items-center gap-2 text-rose-600 text-sm">
              <XCircle className="w-4 h-4" />
              <span>{csvImportError}</span>
            </div>
          )}

          {parsedCsvRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Successfully parsed {parsedCsvRows.length} students</span>
              </div>
              <button
                onClick={handleExecuteCsvImport}
                disabled={isImporting}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl"
              >
                {isImporting ? 'Importing...' : `Import ${parsedCsvRows.length} Students`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};