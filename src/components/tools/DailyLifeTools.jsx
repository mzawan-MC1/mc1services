import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CopyButton, ResetButton, SavePrefsButton, loadPrefs, ShareButtons } from './ToolHelpers';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function DailyLifeTools({ activeTool }) {
  // Utility Bill
  const [acUnits, setAcUnits] = useState('2');
  const [acHours, setAcHours] = useState('8');
  const [waterUsage, setWaterUsage] = useState('15000');
  const [emirate, setEmirate] = useState('dubai');

  // Cost of Living
  const [rent, setRent] = useState('5000');
  const [utilities, setUtilities] = useState('500');
  const [groceries, setGroceries] = useState('1500');
  const [transport, setTransport] = useState('800');
  const [dining, setDining] = useState('1000');
  const [misc, setMisc] = useState('500');

  // Rent Affordability
  const [salary, setSalary] = useState('15000');
  const [targetRent, setTargetRent] = useState('5000');

  // Taxi vs Car
  const [dailyKm, setDailyKm] = useState('30');
  const [workDays, setWorkDays] = useState('22');
  const [carPayment, setCarPayment] = useState('2000');
  const [insurance, setInsurance] = useState('300');
  const [parking, setParking] = useState('500');

  // Petrol with live prices
  const [monthlyKm, setMonthlyKm] = useState('1500');
  const [fuelEfficiency, setFuelEfficiency] = useState('12');
  const [fuelType, setFuelType] = useState('special');
  const [liveFuelPrices, setLiveFuelPrices] = useState(null);
  const [fuelPriceDate, setFuelPriceDate] = useState('December 2024');

  // Default fuel prices (Dec 2024 UAE prices)
  const defaultFuelPrices = { special: 2.66, super: 2.77, e_plus: 2.58, diesel: 2.79 };
  const fuelPrices = liveFuelPrices || defaultFuelPrices;

  // Load saved preferences
  useEffect(() => {
    const rentPrefs = loadPrefs('daily-rent');
    if (rentPrefs?.salary) setSalary(rentPrefs.salary);
    
    const livingPrefs = loadPrefs('daily-living');
    if (livingPrefs?.rent) setRent(livingPrefs.rent);
  }, []);

  if (activeTool === 'utility') {
    const rates = {
      dubai: { elec: 0.38, water: 0.0315, sewage: 0.025 },
      abudhabi: { elec: 0.35, water: 0.03, sewage: 0.02 },
      sharjah: { elec: 0.30, water: 0.028, sewage: 0.02 }
    };
    const r = rates[emirate];
    const acKwh = parseFloat(acUnits) * 1.5 * parseFloat(acHours) * 30;
    const otherKwh = 300;
    const totalKwh = acKwh + otherKwh;
    const elecCost = totalKwh * r.elec;
    const waterGallons = parseFloat(waterUsage);
    const waterCost = waterGallons * r.water;
    const sewageCost = waterGallons * r.sewage;
    const total = elecCost + waterCost + sewageCost + 50; // 50 = housing fee estimate
    const results = { 'Electricity': `AED ${elecCost.toFixed(0)}`, 'Water': `AED ${waterCost.toFixed(0)}`, 'Total': `AED ${total.toFixed(0)}` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Electricity & Water Bill Estimator</h3>
          <ShareButtons toolId="utility" toolName="Utility Bill Estimator" results={results} inputs={{ acUnits, acHours, waterUsage, emirate }} />
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div><Label>Emirate</Label>
            <Select value={emirate} onValueChange={setEmirate}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dubai">Dubai (DEWA)</SelectItem>
                <SelectItem value="abudhabi">Abu Dhabi (ADDC)</SelectItem>
                <SelectItem value="sharjah">Sharjah (SEWA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>AC Units</Label><Input type="number" value={acUnits} onChange={e => setAcUnits(e.target.value)} className="mt-2" /></div>
          <div><Label>AC Hours/Day</Label><Input type="number" value={acHours} onChange={e => setAcHours(e.target.value)} className="mt-2" /></div>
          <div><Label>Water (Gallons/Month)</Label><Input type="number" value={waterUsage} onChange={e => setWaterUsage(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 rounded-xl p-4"><p className="text-xs text-yellow-600">Electricity</p><p className="text-xl font-bold">AED {elecCost.toFixed(0)}</p></div>
          <div className="bg-blue-50 rounded-xl p-4"><p className="text-xs text-blue-600">Water</p><p className="text-xl font-bold">AED {waterCost.toFixed(0)}</p></div>
          <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-600">Sewage</p><p className="text-xl font-bold">AED {sewageCost.toFixed(0)}</p></div>
          <div className="bg-green-50 rounded-xl p-4 relative group">
            <p className="text-xs text-green-600">Total Estimate</p>
            <p className="text-xl font-bold">AED {total.toFixed(0)}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={total.toFixed(0)} label="" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setAcUnits('2'); setAcHours('8'); setWaterUsage('15000'); setEmirate('dubai'); }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'living') {
    const items = [
      { label: 'Rent', value: rent, set: setRent, color: 'bg-blue-500' },
      { label: 'Utilities', value: utilities, set: setUtilities, color: 'bg-yellow-500' },
      { label: 'Groceries', value: groceries, set: setGroceries, color: 'bg-green-500' },
      { label: 'Transport', value: transport, set: setTransport, color: 'bg-purple-500' },
      { label: 'Dining Out', value: dining, set: setDining, color: 'bg-orange-500' },
      { label: 'Miscellaneous', value: misc, set: setMisc, color: 'bg-pink-500' },
    ];
    const total = items.reduce((sum, i) => sum + (parseFloat(i.value) || 0), 0);
    const results = { 'Total Monthly': `AED ${total.toLocaleString()}` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Cost of Living Monthly Budget Calculator</h3>
          <ShareButtons toolId="living" toolName="Cost of Living Calculator" results={results} inputs={{ rent, utilities, groceries, transport, dining, misc }} />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.label}><Label>{item.label} (AED)</Label><Input type="number" value={item.value} onChange={e => item.set(e.target.value)} className="mt-2" /></div>
          ))}
        </div>
        <div className="bg-slate-900 text-white rounded-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400">Total Monthly Expenses</p>
              <p className="text-4xl font-bold">AED {total.toLocaleString()}</p>
            </div>
            <CopyButton value={total.toString()} label="Copy" />
          </div>
          <div className="flex gap-1 mt-4 h-3 rounded-full overflow-hidden">
            {items.map(item => {
              const pct = (parseFloat(item.value) / total) * 100;
              return <div key={item.label} className={`${item.color}`} style={{ width: `${pct}%` }} title={item.label} />;
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {items.map(item => (
              <span key={item.label} className="text-xs flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${item.color}`}></span>{item.label}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setRent('5000'); setUtilities('500'); setGroceries('1500'); setTransport('800'); setDining('1000'); setMisc('500'); }} />
          <SavePrefsButton toolId="daily-living" values={{ rent }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'rent') {
    const sal = parseFloat(salary) || 0;
    const rnt = parseFloat(targetRent) || 0;
    const ratio = sal > 0 ? ((rnt / sal) * 100).toFixed(1) : 0;
    const recommended = sal * 0.3;
    let status = 'Affordable';
    let color = 'bg-green-50 text-green-700';
    if (ratio > 40) { status = 'Too Expensive'; color = 'bg-red-50 text-red-700'; }
    else if (ratio > 30) { status = 'Stretching Budget'; color = 'bg-yellow-50 text-yellow-700'; }
    const results = { 'Ratio': `${ratio}%`, 'Status': status, 'Max Rent': `AED ${recommended.toLocaleString()}` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Rent Affordability Calculator</h3>
          <ShareButtons toolId="rent" toolName="Rent Calculator" results={results} inputs={{ salary, targetRent }} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Monthly Salary (AED)</Label><Input type="number" value={salary} onChange={e => setSalary(e.target.value)} className="mt-2" /></div>
          <div><Label>Target Monthly Rent (AED)</Label><Input type="number" value={targetRent} onChange={e => setTargetRent(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-sm text-blue-600">Rent-to-Income Ratio</p><p className="text-3xl font-bold">{ratio}%</p></div>
          <div className={`rounded-xl p-4 text-center ${color}`}><p className="text-sm">Status</p><p className="text-2xl font-bold">{status}</p></div>
          <div className="bg-slate-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-slate-600">Recommended Max Rent</p>
            <p className="text-3xl font-bold">AED {recommended.toLocaleString()}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={recommended.toString()} label="" />
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500">💡 Experts recommend keeping rent below 30% of your gross income.</p>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setSalary('15000'); setTargetRent('5000'); }} />
          <SavePrefsButton toolId="daily-rent" values={{ salary }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'transport') {
    const km = parseFloat(dailyKm) * parseFloat(workDays);
    const taxiFare = 12 + (km * 1.96); // Base fare + per km
    const carPetrol = (km / 12) * 2.94;
    const carTotal = parseFloat(carPayment) + parseFloat(insurance) + parseFloat(parking) + carPetrol + 200; // 200 maintenance
    const savings = taxiFare - carTotal;
    const results = { 'Taxi': `AED ${taxiFare.toFixed(0)}`, 'Car': `AED ${carTotal.toFixed(0)}`, 'Savings': `AED ${Math.abs(savings).toFixed(0)}` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Taxi vs Own Car Cost Comparison</h3>
          <ShareButtons toolId="transport" toolName="Transport Calculator" results={results} inputs={{ dailyKm, workDays, carPayment, insurance, parking }} />
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          <div><Label>Daily KM</Label><Input type="number" value={dailyKm} onChange={e => setDailyKm(e.target.value)} className="mt-2" /></div>
          <div><Label>Work Days/Month</Label><Input type="number" value={workDays} onChange={e => setWorkDays(e.target.value)} className="mt-2" /></div>
          <div><Label>Car Payment (AED)</Label><Input type="number" value={carPayment} onChange={e => setCarPayment(e.target.value)} className="mt-2" /></div>
          <div><Label>Insurance (AED)</Label><Input type="number" value={insurance} onChange={e => setInsurance(e.target.value)} className="mt-2" /></div>
          <div><Label>Parking (AED)</Label><Input type="number" value={parking} onChange={e => setParking(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 rounded-xl p-4 text-center"><p className="text-sm text-yellow-600">Taxi Cost/Month</p><p className="text-2xl font-bold">AED {taxiFare.toFixed(0)}</p></div>
          <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-sm text-blue-600">Own Car Cost/Month</p><p className="text-2xl font-bold">AED {carTotal.toFixed(0)}</p></div>
          <div className={`rounded-xl p-4 text-center ${savings > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm ${savings > 0 ? 'text-green-600' : 'text-red-600'}`}>{savings > 0 ? 'You Save with Car' : 'Taxi is Cheaper'}</p>
            <p className="text-2xl font-bold">AED {Math.abs(savings).toFixed(0)}/mo</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <CopyButton value={`Taxi: AED ${taxiFare.toFixed(0)}, Car: AED ${carTotal.toFixed(0)}`} label="Copy Results" />
          <ResetButton onReset={() => { setDailyKm('30'); setWorkDays('22'); setCarPayment('2000'); setInsurance('300'); setParking('500'); }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'petrol') {
    const km = parseFloat(monthlyKm) || 0;
    const eff = parseFloat(fuelEfficiency) || 12;
    const liters = km / eff;
    const cost = liters * fuelPrices[fuelType];
    const results = { 'Monthly': `AED ${cost.toFixed(0)}`, 'Yearly': `AED ${(cost * 12).toFixed(0)}` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xl font-bold">Petrol Cost Calculator</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">UAE Prices: {fuelPriceDate}</span>
            <ShareButtons toolId="petrol" toolName="Petrol Calculator" results={results} inputs={{ monthlyKm, fuelEfficiency, fuelType }} />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div><Label>Monthly KM</Label><Input type="number" value={monthlyKm} onChange={e => setMonthlyKm(e.target.value)} className="mt-2" /></div>
          <div><Label>Fuel Efficiency (km/L)</Label><Input type="number" value={fuelEfficiency} onChange={e => setFuelEfficiency(e.target.value)} className="mt-2" /></div>
          <div><Label>Fuel Type</Label>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="special">Special 95 (AED {fuelPrices.special})</SelectItem>
                <SelectItem value="super">Super 98 (AED {fuelPrices.super})</SelectItem>
                <SelectItem value="e_plus">E-Plus 91 (AED {fuelPrices.e_plus})</SelectItem>
                <SelectItem value="diesel">Diesel (AED {fuelPrices.diesel})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center"><p className="text-sm text-slate-600">Liters Needed</p><p className="text-2xl font-bold">{liters.toFixed(1)} L</p></div>
          <div className="bg-green-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-green-600">Monthly Cost</p>
            <p className="text-2xl font-bold">AED {cost.toFixed(0)}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={cost.toFixed(0)} label="" />
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-sm text-blue-600">Yearly Cost</p><p className="text-2xl font-bold">AED {(cost * 12).toFixed(0)}</p></div>
        </div>
        <p className="text-xs text-slate-500">* Fuel prices are updated monthly by UAE Ministry of Energy. Current prices as of {fuelPriceDate}.</p>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setMonthlyKm('1500'); setFuelEfficiency('12'); setFuelType('special'); }} />
          <SavePrefsButton toolId="daily-petrol" values={{ fuelType, fuelEfficiency }} />
        </div>
      </div>
    );
  }

  return null;
}