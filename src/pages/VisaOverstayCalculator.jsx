import React, { useState } from 'react';
import { Plane, AlertCircle, Info, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ToolLayout from '../components/tools/ToolLayout';

const visaTypes = [
  { value: 'visit_30', label: 'Visit Visa (30 days)', duration: 30, grace: 10, finePerDay: 100, maxFine: 50000 },
  { value: 'visit_90', label: 'Visit Visa (90 days)', duration: 90, grace: 10, finePerDay: 100, maxFine: 50000 },
  { value: 'tourist', label: 'Tourist Visa (On-arrival)', duration: 30, grace: 10, finePerDay: 100, maxFine: 50000 },
  { value: 'employment', label: 'Employment Visa', duration: 0, grace: 30, finePerDay: 125, maxFine: 50000 },
  { value: 'residence', label: 'Residence Visa', duration: 0, grace: 30, finePerDay: 125, maxFine: 50000 },
  { value: 'transit', label: 'Transit Visa (96 hours)', duration: 4, grace: 0, finePerDay: 100, maxFine: 50000 },
];

export default function VisaOverstayCalculator() {
  const [visaType, setVisaType] = useState('visit_30');
  const [entryDate, setEntryDate] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (!entryDate || !exitDate) return;

    const entry = new Date(entryDate);
    const exit = new Date(exitDate);
    const selectedVisa = visaTypes.find(v => v.value === visaType);

    const totalDays = Math.ceil((exit - entry) / (1000 * 60 * 60 * 24));
    const allowedDays = selectedVisa.duration + selectedVisa.grace;
    const overstayDays = Math.max(0, totalDays - allowedDays);

    let fine = 0;
    let status = 'valid';
    let statusColor = 'bg-green-100 text-green-700';

    if (totalDays > selectedVisa.duration && totalDays <= allowedDays) {
      status = 'In Grace Period';
      statusColor = 'bg-yellow-100 text-yellow-700';
    } else if (overstayDays > 0) {
      status = 'Overstayed';
      statusColor = 'bg-red-100 text-red-700';
      fine = Math.min(overstayDays * selectedVisa.finePerDay, selectedVisa.maxFine);
    }

    setResult({
      totalDays,
      visaDuration: selectedVisa.duration,
      gracePeriod: selectedVisa.grace,
      overstayDays,
      fine,
      status,
      statusColor,
      finePerDay: selectedVisa.finePerDay
    });
  };

  const selectedVisa = visaTypes.find(v => v.value === visaType);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "UAE Visa Overstay Fine Calculator",
    "description": "Calculate visa overstay fines in UAE. Check grace periods for visit visa, tourist visa, employment visa, and residence visa.",
    "applicationCategory": "TravelApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "AED"
    },
    "provider": {
      "@type": "Organization",
      "name": "MCS Consultancy"
    }
  };

  return (
    <ToolLayout
      title="UAE Visa Overstay Fine Calculator"
      description="Calculate overstay fines and check grace periods for different UAE visa types."
      icon={Plane}
      color="from-purple-600 to-pink-600"
      metaTitle="UAE Visa Overstay Fine Calculator 2024 | Check Grace Period & Penalties"
      metaDescription="Calculate UAE visa overstay fines for visit, tourist, employment & residence visas. Free calculator shows grace periods, daily fines (AED 100-125/day), and total penalties. GDRFA rules explained."
      schemaData={schemaData}
    >
      <div className="space-y-8">
        {/* Form */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label>Visa Type</Label>
            <Select value={visaType} onValueChange={setVisaType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visaTypes.map(v => (
                  <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="entry">Entry Date / Visa Issue Date</Label>
            <Input
              id="entry"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="exit">Planned Exit Date</Label>
            <Input
              id="exit"
              type="date"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {/* Visa Info */}
        <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600">
            <p><strong>Selected Visa:</strong> {selectedVisa?.label}</p>
            <p><strong>Validity:</strong> {selectedVisa?.duration > 0 ? `${selectedVisa?.duration} days` : 'As per visa stamp'}</p>
            <p><strong>Grace Period:</strong> {selectedVisa?.grace} days</p>
            <p><strong>Fine per day:</strong> AED {selectedVisa?.finePerDay}</p>
          </div>
        </div>

        <Button onClick={calculate} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 text-lg">
          <Calendar className="w-5 h-5 mr-2" />
          Calculate Overstay
        </Button>

        {/* Results */}
        {result && (
          <div className="border-t pt-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Calculation Results</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-slate-600 mb-1">Total Stay</p>
                <p className="text-2xl font-bold text-slate-900">{result.totalDays} days</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-slate-600 mb-1">Visa + Grace</p>
                <p className="text-2xl font-bold text-slate-900">{result.visaDuration + result.gracePeriod} days</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-5">
                <p className="text-sm text-purple-600 mb-1">Overstay Days</p>
                <p className="text-2xl font-bold text-slate-900">{result.overstayDays} days</p>
              </div>
              <div className="bg-red-50 rounded-xl p-5">
                <p className="text-sm text-red-600 mb-1">Estimated Fine</p>
                <p className="text-2xl font-bold text-red-600">AED {result.fine.toLocaleString()}</p>
              </div>
            </div>

            {/* Status */}
            <div className={`rounded-xl p-4 ${result.statusColor.replace('text-', 'bg-').split(' ')[0]}`}>
              <div className="flex items-center gap-3">
                {result.status === 'valid' ? (
                  <Badge className="bg-green-500 text-white">✓ Within Validity</Badge>
                ) : result.status === 'In Grace Period' ? (
                  <Badge className="bg-yellow-500 text-white">⚠ In Grace Period</Badge>
                ) : (
                  <Badge className="bg-red-500 text-white">⚠ Overstayed</Badge>
                )}
                <span className="font-medium">
                  {result.status === 'valid' && 'Your stay is within the visa validity period.'}
                  {result.status === 'In Grace Period' && 'You are in the grace period. No fine yet, but exit soon.'}
                  {result.status === 'Overstayed' && `Fine calculated at AED ${result.finePerDay}/day for ${result.overstayDays} days.`}
                </span>
              </div>
            </div>

            {/* Fine Breakdown */}
            {result.overstayDays > 0 && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Fine Breakdown</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Overstay days</td>
                      <td className="text-right py-2">{result.overstayDays} days</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Fine per day</td>
                      <td className="text-right py-2">AED {result.finePerDay}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Subtotal</td>
                      <td className="text-right py-2">AED {(result.overstayDays * result.finePerDay).toLocaleString()}</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="py-2">Total Fine (capped at 50,000)</td>
                      <td className="text-right py-2 text-red-600">AED {result.fine.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Rules */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">UAE Visa Overstay Rules</h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Visit/Tourist Visa</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>10-day grace period after visa expiry</li>
                <li>AED 100/day fine after grace period</li>
                <li>Maximum fine capped at AED 50,000</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Employment/Residence Visa</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>30-day grace period after visa cancellation</li>
                <li>AED 125/day fine after grace period (first 6 months)</li>
                <li>Maximum fine capped at AED 50,000</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800">
                <strong>Disclaimer:</strong> This calculator provides estimates only. 
                Actual fines may vary. Contact GDRFA or ICP for official information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}