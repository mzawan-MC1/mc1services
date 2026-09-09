import { useState } from 'react';
import { Car, ExternalLink, AlertTriangle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ToolLayout from '../components/tools/ToolLayout';

const emirates = [
  { value: 'dubai', label: 'Dubai', url: 'https://www.rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=2963652' },
  { value: 'abudhabi', label: 'Abu Dhabi', url: 'https://www.adpolice.gov.ae/en/services/trafficservices/pages/trafficfines.aspx' },
  { value: 'sharjah', label: 'Sharjah', url: 'https://www.shjpolice.gov.ae/shjpolice/trafficfine.html' },
  { value: 'ajman', label: 'Ajman', url: 'https://www.ajmanpolice.gov.ae/' },
  { value: 'rak', label: 'Ras Al Khaimah', url: 'https://www.rakpolice.gov.ae/' },
  { value: 'fujairah', label: 'Fujairah', url: 'https://www.fujpolice.gov.ae/' },
  { value: 'uaq', label: 'Umm Al Quwain', url: 'https://www.uaqpolice.gov.ae/' },
];

const categories = [
  { value: 'private', label: 'Private' },
  { value: 'taxi', label: 'Taxi' },
  { value: 'transport', label: 'Transport' },
  { value: 'motorcycle', label: 'Motorcycle' },
];

const sampleFines = [
  { id: 1, violation: 'Exceeding speed limit by 20-30 km/h', fine: 600, points: 4, date: '2024-01-15' },
  { id: 2, violation: 'Running a red light', fine: 1000, points: 12, date: '2024-01-10' },
  { id: 3, violation: 'Using mobile phone while driving', fine: 800, points: 4, date: '2024-01-05' },
  { id: 4, violation: 'Not wearing seatbelt', fine: 400, points: 4, date: '2023-12-20' },
  { id: 5, violation: 'Illegal parking', fine: 200, points: 0, date: '2023-12-15' },
];

export default function TrafficFinesChecker() {
  const [plateNumber, setPlateNumber] = useState('');
  const [emirate, setEmirate] = useState('dubai');
  const [category, setCategory] = useState('private');
  const [code, setCode] = useState('');
  const [showResults, setShowResults] = useState(false);

  const selectedEmirate = emirates.find(e => e.value === emirate);

  const handleCheck = () => {
    setShowResults(true);
  };

  const totalFines = sampleFines.reduce((sum, f) => sum + f.fine, 0);
  const totalPoints = sampleFines.reduce((sum, f) => sum + f.points, 0);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "UAE Traffic Fines Checker",
    "description": "Check traffic fines across all UAE emirates including Dubai, Abu Dhabi, Sharjah. Get direct links to official police portals.",
    "applicationCategory": "UtilitiesApplication",
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
      title="UAE Traffic Fines Checker"
      description="Check your traffic fines by plate number and get direct links to official portals."
      icon={Car}
      color="from-red-600 to-orange-600"
      metaTitle="UAE Traffic Fines Checker 2024 | Check Fines in Dubai, Abu Dhabi, Sharjah"
      metaDescription="Free UAE traffic fines checker. Look up fines by plate number for Dubai RTA, Abu Dhabi Police, Sharjah Police. View black points, fine amounts, and pay online via official portals."
      schemaData={schemaData}
    >
      <div className="space-y-8">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Demo Version</p>
            <p className="text-sm text-amber-700">
              This tool shows sample data for demonstration purposes. For actual fines,
              please use the official government portals linked below.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="emirate">Emirate</Label>
            <Select value={emirate} onValueChange={setEmirate}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {emirates.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Plate Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="code">Plate Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., A, B, AA"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="plate">Plate Number</Label>
            <Input
              id="plate"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="e.g., 12345"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleCheck} className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-6">
            <Search className="w-5 h-5 mr-2" />
            Check Fines (Demo)
          </Button>
          <a href={selectedEmirate?.url} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" className="w-full py-6">
              <ExternalLink className="w-5 h-5 mr-2" />
              Official {selectedEmirate?.label} Portal
            </Button>
          </a>
        </div>

        {/* Sample Results */}
        {showResults && (
          <div className="border-t pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Sample Fines (Demo Data)</h3>
              <Badge variant="secondary">Demo Mode</Badge>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600">Total Fines</p>
                <p className="text-2xl font-bold text-slate-900">AED {totalFines.toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-sm text-orange-600">Black Points</p>
                <p className="text-2xl font-bold text-slate-900">{totalPoints}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-600">Violations</p>
                <p className="text-2xl font-bold text-slate-900">{sampleFines.length}</p>
              </div>
            </div>

            {/* Fines List */}
            <div className="space-y-3">
              {sampleFines.map(fine => (
                <div key={fine.id} className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{fine.violation}</p>
                    <p className="text-sm text-slate-500">{fine.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">AED {fine.fine}</p>
                    {fine.points > 0 && (
                      <p className="text-sm text-orange-600">{fine.points} points</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Links */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Official Traffic Fine Portals</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {emirates.map(e => (
              <a
                key={e.value}
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{e.label} Police</span>
              </a>
            ))}
          </div>
        </div>

        {/* Common Fines */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Common UAE Traffic Fines</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 rounded-l-lg">Violation</th>
                  <th className="text-right p-3">Fine (AED)</th>
                  <th className="text-right p-3 rounded-r-lg">Black Points</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="p-3">Running red light</td><td className="text-right p-3">1,000</td><td className="text-right p-3">12</td></tr>
                <tr className="border-b"><td className="p-3">Speeding (over 60 km/h above limit)</td><td className="text-right p-3">3,000</td><td className="text-right p-3">23</td></tr>
                <tr className="border-b"><td className="p-3">Using phone while driving</td><td className="text-right p-3">800</td><td className="text-right p-3">4</td></tr>
                <tr className="border-b"><td className="p-3">Not wearing seatbelt</td><td className="text-right p-3">400</td><td className="text-right p-3">4</td></tr>
                <tr><td className="p-3">Illegal parking</td><td className="text-right p-3">200-1,000</td><td className="text-right p-3">0</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
