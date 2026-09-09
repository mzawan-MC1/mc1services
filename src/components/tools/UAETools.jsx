import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CopyButton, ResetButton, SavePrefsButton, loadPrefs } from './ToolHelpers';
import ShareTool from './ShareTool';
import { Calendar } from 'lucide-react';

export default function UAETools({ activeTool }) {
  // Salik Calculator
  const [salikTrips, setSalikTrips] = useState('2');
  const [salikDays, setSalikDays] = useState('22');
  const [selectedRoute, setSelectedRoute] = useState('shk_zayed');

  // Telecom Bill
  const [dataUsage, setDataUsage] = useState('10');
  const [callMinutes, setCallMinutes] = useState('100');
  const [provider, setProvider] = useState('etisalat');
  const [planType, setPlanType] = useState('postpaid');

  // Load preferences
  useEffect(() => {
    const salikPrefs = loadPrefs('uae-salik');
    if (salikPrefs) {
      if (salikPrefs.salikTrips) setSalikTrips(salikPrefs.salikTrips);
      if (salikPrefs.salikDays) setSalikDays(salikPrefs.salikDays);
    }
    const telecomPrefs = loadPrefs('uae-telecom');
    if (telecomPrefs) {
      if (telecomPrefs.provider) setProvider(telecomPrefs.provider);
    }
  }, []);

  // Salik routes and gates
  const salikRoutes = {
    shk_zayed: { name: 'Sheikh Zayed Road (Business Bay)', gates: 2, desc: 'Business Bay Crossing + Al Safa' },
    airport: { name: 'Airport Road', gates: 1, desc: 'Airport Tunnel' },
    al_maktoum: { name: 'Al Maktoum Bridge', gates: 1, desc: 'Al Maktoum Bridge Gate' },
    garhoud: { name: 'Al Garhoud Bridge', gates: 1, desc: 'Al Garhoud Bridge Gate' },
    al_barsha: { name: 'Al Barsha/Mall of Emirates', gates: 1, desc: 'Al Safa South Gate' },
    deira: { name: 'Deira Islands', gates: 1, desc: 'Deira Islands Gate' },
    jebel_ali: { name: 'Jebel Ali', gates: 1, desc: 'Jebel Ali Gate' },
  };

  // UAE Public Holidays 2024-2025
  const holidays = [
    { date: '2025-01-01', name: 'New Year\'s Day', type: 'Public', days: 1 },
    { date: '2025-03-30', name: 'Eid Al Fitr (Expected)', type: 'Islamic', days: 4 },
    { date: '2025-06-06', name: 'Eid Al Adha (Expected)', type: 'Islamic', days: 4 },
    { date: '2025-06-27', name: 'Islamic New Year (Expected)', type: 'Islamic', days: 1 },
    { date: '2025-09-05', name: 'Prophet\'s Birthday (Expected)', type: 'Islamic', days: 1 },
    { date: '2025-12-01', name: 'Commemoration Day', type: 'National', days: 1 },
    { date: '2025-12-02', name: 'UAE National Day', type: 'National', days: 2 },
  ];

  if (activeTool === 'salik') {
    const trips = parseInt(salikTrips) || 0;
    const days = parseInt(salikDays) || 0;
    const route = salikRoutes[selectedRoute];
    const gatesPerTrip = route?.gates || 1;
    const costPerGate = 4; // AED 4 per Salik gate

    const dailyCost = trips * gatesPerTrip * costPerGate;
    const monthlyCost = dailyCost * days;
    const yearlyCost = monthlyCost * 12;

    const results = {
      'Daily Cost': `AED ${dailyCost}`,
      'Monthly Cost': `AED ${monthlyCost}`,
      'Yearly Cost': `AED ${yearlyCost.toLocaleString()}`
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Salik Toll Calculator</h3>
          <ShareTool toolId="salik" toolName="Salik Calculator" results={results} inputs={{ salikTrips, salikDays, selectedRoute }} />
        </div>
        <p className="text-sm text-slate-500">Calculate your monthly Salik toll expenses based on your routes and trips.</p>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Common Route</Label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(salikRoutes).map(([key, route]) => (
                  <SelectItem key={key} value={key}>{route.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">{route?.desc} ({route?.gates} gate{route?.gates > 1 ? 's' : ''})</p>
          </div>
          <div>
            <Label>Round Trips per Day</Label>
            <Input type="number" value={salikTrips} onChange={e => setSalikTrips(e.target.value)} className="mt-2" min="0" />
          </div>
          <div>
            <Label>Working Days per Month</Label>
            <Input type="number" value={salikDays} onChange={e => setSalikDays(e.target.value)} className="mt-2" min="0" max="31" />
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-600 mb-3">
            <strong>Gates per round trip:</strong> {gatesPerTrip * 2} (going + returning) × AED 4 each = <strong>AED {gatesPerTrip * 2 * 4}</strong> per round trip
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-blue-600">Daily Cost</p>
            <p className="text-2xl font-bold">AED {dailyCost}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={dailyCost.toString()} label="" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-green-600">Monthly Cost</p>
            <p className="text-2xl font-bold">AED {monthlyCost}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={monthlyCost.toString()} label="" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-purple-600">Yearly Cost</p>
            <p className="text-2xl font-bold">AED {yearlyCost.toLocaleString()}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={yearlyCost.toString()} label="" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-2">All Salik Gate Locations</h4>
          <ul className="text-sm text-amber-700 grid md:grid-cols-2 gap-1">
            <li>• Al Maktoum Bridge</li>
            <li>• Al Garhoud Bridge</li>
            <li>• Al Safa (Sheikh Zayed Rd)</li>
            <li>• Al Barsha (Mall of Emirates)</li>
            <li>• Airport Tunnel</li>
            <li>• Al Mamzar North & South</li>
            <li>• Business Bay Crossing</li>
            <li>• Jebel Ali</li>
          </ul>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setSalikTrips('2'); setSalikDays('22'); setSelectedRoute('shk_zayed'); }} />
          <SavePrefsButton toolId="uae-salik" values={{ salikTrips, salikDays }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'telecom') {
    const data = parseFloat(dataUsage) || 0;
    const minutes = parseInt(callMinutes) || 0;

    // Approximate pricing (simplified)
    const plans = {
      etisalat: {
        postpaid: { base: 150, dataRate: 10, minuteRate: 0.28, name: 'Etisalat Postpaid' },
        prepaid: { base: 0, dataRate: 15, minuteRate: 0.35, name: 'Etisalat Prepaid' },
      },
      du: {
        postpaid: { base: 149, dataRate: 9, minuteRate: 0.25, name: 'du Postpaid' },
        prepaid: { base: 0, dataRate: 14, minuteRate: 0.30, name: 'du Prepaid' },
      }
    };

    const plan = plans[provider][planType];
    const dataCost = Math.max(0, (data - 5) * plan.dataRate); // First 5GB usually included in base
    const callCost = minutes * plan.minuteRate;
    const subtotal = plan.base + dataCost + callCost;
    const vat = subtotal * 0.05;
    const total = subtotal + vat;

    const results = {
      'Plan': plan.name,
      'Monthly Estimate': `AED ${total.toFixed(0)}`
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Etisalat/du Bill Estimator</h3>
          <ShareTool toolId="telecom" toolName="Telecom Bill Estimator" results={results} inputs={{ dataUsage, callMinutes, provider, planType }} />
        </div>
        <p className="text-sm text-slate-500">Estimate your monthly mobile bill based on typical usage patterns.</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="etisalat">Etisalat</SelectItem>
                <SelectItem value="du">du</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Plan Type</Label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="postpaid">Postpaid</SelectItem>
                <SelectItem value="prepaid">Prepaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Monthly Data Usage (GB)</Label>
            <Input type="number" value={dataUsage} onChange={e => setDataUsage(e.target.value)} className="mt-2" min="0" />
          </div>
          <div>
            <Label>Call Minutes per Month</Label>
            <Input type="number" value={callMinutes} onChange={e => setCallMinutes(e.target.value)} className="mt-2" min="0" />
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <h4 className="font-semibold mb-3">{plan.name} Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Base Plan (5GB included)</span><span>AED {plan.base}</span></div>
            {data > 5 && <div className="flex justify-between"><span>Additional Data ({(data - 5).toFixed(0)} GB × AED {plan.dataRate})</span><span>AED {dataCost.toFixed(0)}</span></div>}
            <div className="flex justify-between"><span>Call Charges ({minutes} min × AED {plan.minuteRate})</span><span>AED {callCost.toFixed(0)}</span></div>
            <div className="flex justify-between text-slate-500"><span>VAT (5%)</span><span>AED {vat.toFixed(0)}</span></div>
            <div className="flex justify-between font-bold pt-2 border-t"><span>Total Estimate</span><span>AED {total.toFixed(0)}</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-6 text-center">
          <p className="text-blue-100 text-sm">Estimated Monthly Bill</p>
          <p className="text-4xl font-bold">AED {total.toFixed(0)}</p>
        </div>

        <p className="text-xs text-slate-500">* Estimates based on typical plan structures. Actual bills may vary. Check official Etisalat/du websites for current plans.</p>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setDataUsage('10'); setCallMinutes('100'); setProvider('etisalat'); setPlanType('postpaid'); }} />
          <SavePrefsButton toolId="uae-telecom" values={{ provider }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'holidays') {
    const today = new Date();
    const upcomingHolidays = holidays.filter(h => new Date(h.date) >= today);
    const nextHoliday = upcomingHolidays[0];
    const daysUntilNext = nextHoliday ? Math.ceil((new Date(nextHoliday.date) - today) / (1000 * 60 * 60 * 24)) : 0;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">UAE Public Holidays 2025</h3>
          <ShareTool toolId="holidays" toolName="UAE Public Holidays" />
        </div>
        <p className="text-sm text-slate-500">Complete guide to UAE public holidays with dates and types.</p>

        {nextHoliday && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-10 h-10" />
              <div>
                <p className="text-green-100 text-sm">Next Holiday</p>
                <p className="text-2xl font-bold">{nextHoliday.name}</p>
                <p className="text-green-100">{new Date(nextHoliday.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {daysUntilNext} days away</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {holidays.map((holiday, i) => {
            const isPast = new Date(holiday.date) < today;
            const date = new Date(holiday.date);
            return (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${isPast ? 'bg-slate-50 opacity-60' : 'bg-white'}`}>
                <div className="text-center min-w-[60px]">
                  <p className="text-2xl font-bold text-slate-800">{date.getDate()}</p>
                  <p className="text-xs text-slate-500 uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{holiday.name}</p>
                  <p className="text-sm text-slate-500">{date.toLocaleDateString('en-US', { weekday: 'long' })} • {holiday.days} day{holiday.days > 1 ? 's' : ''} off</p>
                </div>
                <Badge className={
                  holiday.type === 'Islamic' ? 'bg-green-100 text-green-700' :
                  holiday.type === 'National' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }>{holiday.type}</Badge>
              </div>
            );
          })}
        </div>

        <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
          <strong>Note:</strong> Islamic holidays are based on the lunar calendar and dates may vary by 1-2 days. Official dates are announced closer to each holiday.
        </div>
      </div>
    );
  }

  return null;
}
