import React, { useState } from 'react';
import { CreditCard, MapPin, ExternalLink, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolLayout from '../components/tools/ToolLayout';

const salikGates = [
  { id: 'maktoum', name: 'Maktoum Bridge' },
  { id: 'garhoud', name: 'Al Garhoud Bridge' },
  { id: 'safa', name: 'Al Safa' },
  { id: 'barsha', name: 'Al Barsha' },
  { id: 'mall', name: 'Mall of the Emirates' },
  { id: 'mamzar', name: 'Al Mamzar North' },
  { id: 'mamzar_south', name: 'Al Mamzar South' },
  { id: 'airport', name: 'Airport Tunnel' },
];

const mawaqifZones = [
  { value: 'premium', label: 'Premium (Blue)', rate: 4, desc: 'AED 4/hour' },
  { value: 'standard', label: 'Standard (Grey)', rate: 3, desc: 'AED 3/hour' },
  { value: 'economy', label: 'Economy (Black)', rate: 2, desc: 'AED 2/hour' },
];

const nolCards = [
  { value: 'gold', label: 'Gold Card', discount: 0 },
  { value: 'silver', label: 'Silver Card', discount: 0 },
  { value: 'blue', label: 'Blue Card (Tourist)', discount: 0 },
  { value: 'red', label: 'Red Ticket', discount: 0 },
];

export default function TollEstimator() {
  // Salik
  const [salikGate, setSalikGate] = useState('maktoum');
  const [salikTrips, setSalikTrips] = useState('');
  const [salikDays, setSalikDays] = useState('30');

  // Mawaqif
  const [mawaqifZone, setMawaqifZone] = useState('standard');
  const [parkingHours, setParkingHours] = useState('');
  const [parkingDays, setParkingDays] = useState('20');

  // NOL
  const [nolCard, setNolCard] = useState('silver');
  const [metroTrips, setMetroTrips] = useState('');
  const [metroZones, setMetroZones] = useState('1');

  const [results, setResults] = useState(null);

  const calculateSalik = () => {
    const trips = parseInt(salikTrips) || 0;
    const days = parseInt(salikDays) || 1;
    const costPerTrip = 4; // AED 4 per Salik gate
    const totalCost = trips * days * costPerTrip;
    const rechargeAmount = Math.ceil(totalCost / 50) * 50; // Round up to nearest 50

    return { totalCost, rechargeAmount, trips, days };
  };

  const calculateMawaqif = () => {
    const hours = parseFloat(parkingHours) || 0;
    const days = parseInt(parkingDays) || 1;
    const zone = mawaqifZones.find(z => z.value === mawaqifZone);
    const dailyCost = hours * zone.rate;
    const totalCost = dailyCost * days;
    const rechargeAmount = Math.ceil(totalCost / 50) * 50;

    return { totalCost, dailyCost, rechargeAmount, hours, days, zone };
  };

  const calculateNOL = () => {
    const trips = parseInt(metroTrips) || 0;
    const zones = parseInt(metroZones) || 1;
    // Metro fares based on zones
    const zoneFares = { 1: 3, 2: 5, 3: 7.5 }; // Within zone, 2 zones, 3+ zones
    const farePerTrip = zoneFares[zones] || zoneFares[3];
    const totalCost = trips * farePerTrip;
    const rechargeAmount = Math.ceil(totalCost / 10) * 10;

    return { totalCost, rechargeAmount, trips, farePerTrip };
  };

  const calculate = () => {
    setResults({
      salik: calculateSalik(),
      mawaqif: calculateMawaqif(),
      nol: calculateNOL()
    });
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Dubai Salik, NOL & Mawaqif Cost Calculator",
    "description": "Calculate monthly Salik toll charges, Dubai Metro NOL card costs, and Mawaqif parking fees. Plan your transportation budget in UAE.",
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
      title="Salik / NOL / Mawaqif Cost Estimator"
      description="Calculate your toll, metro, and parking costs across UAE."
      icon={CreditCard}
      color="from-green-600 to-teal-600"
      metaTitle="Dubai Salik, NOL & Mawaqif Calculator 2024 | Toll, Metro & Parking Costs"
      metaDescription="Free calculator for Dubai transportation costs. Estimate monthly Salik toll (AED 4/gate), NOL metro fares, and Mawaqif parking fees. Plan your budget with recommended recharge amounts."
      schemaData={schemaData}
    >
      <div className="space-y-8">
        <Tabs defaultValue="salik" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="salik">Salik (Toll)</TabsTrigger>
            <TabsTrigger value="mawaqif">Mawaqif (Parking)</TabsTrigger>
            <TabsTrigger value="nol">NOL (Metro)</TabsTrigger>
          </TabsList>

          {/* Salik Tab */}
          <TabsContent value="salik" className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Salik Gate</Label>
                <Select value={salikGate} onValueChange={setSalikGate}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {salikGates.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trips per Day (one-way)</Label>
                <Input
                  type="number"
                  value={salikTrips}
                  onChange={(e) => setSalikTrips(e.target.value)}
                  placeholder="e.g., 2"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Number of Days</Label>
                <Input
                  type="number"
                  value={salikDays}
                  onChange={(e) => setSalikDays(e.target.value)}
                  placeholder="e.g., 30"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">
                Each Salik gate crossing costs <strong>AED 4</strong>. Minimum account balance: AED 50.
              </p>
            </div>
          </TabsContent>

          {/* Mawaqif Tab */}
          <TabsContent value="mawaqif" className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Parking Zone</Label>
                <Select value={mawaqifZone} onValueChange={setMawaqifZone}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mawaqifZones.map(z => (
                      <SelectItem key={z.value} value={z.value}>{z.label} - {z.desc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hours per Day</Label>
                <Input
                  type="number"
                  value={parkingHours}
                  onChange={(e) => setParkingHours(e.target.value)}
                  placeholder="e.g., 8"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Working Days per Month</Label>
                <Input
                  type="number"
                  value={parkingDays}
                  onChange={(e) => setParkingDays(e.target.value)}
                  placeholder="e.g., 20"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Mawaqif parking is free on Sundays. Paid hours: 8 AM - 10 PM (Sat-Thu).
              </p>
            </div>
          </TabsContent>

          {/* NOL Tab */}
          <TabsContent value="nol" className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>NOL Card Type</Label>
                <Select value={nolCard} onValueChange={setNolCard}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nolCards.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trips per Month</Label>
                <Input
                  type="number"
                  value={metroTrips}
                  onChange={(e) => setMetroTrips(e.target.value)}
                  placeholder="e.g., 40"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Zones Crossed</Label>
                <Select value={metroZones} onValueChange={setMetroZones}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Within Zone (AED 3)</SelectItem>
                    <SelectItem value="2">2 Zones (AED 5)</SelectItem>
                    <SelectItem value="3">3+ Zones (AED 7.5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={calculate} className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-6 text-lg">
          Calculate Costs
        </Button>

        {/* Results */}
        {results && (
          <div className="border-t pt-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Cost Summary</h3>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Salik */}
              <div className="bg-green-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-green-500">Salik</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-1">Monthly Cost</p>
                <p className="text-2xl font-bold text-slate-900">AED {results.salik.totalCost.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {results.salik.trips} trips × {results.salik.days} days × AED 4
                </p>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm text-green-700">Recommended Recharge: <strong>AED {results.salik.rechargeAmount}</strong></p>
                </div>
              </div>

              {/* Mawaqif */}
              <div className="bg-blue-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-500">Mawaqif</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-1">Monthly Cost</p>
                <p className="text-2xl font-bold text-slate-900">AED {results.mawaqif.totalCost.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {results.mawaqif.hours}h × {results.mawaqif.days} days × AED {results.mawaqif.zone?.rate}
                </p>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm text-blue-700">Recommended Recharge: <strong>AED {results.mawaqif.rechargeAmount}</strong></p>
                </div>
              </div>

              {/* NOL */}
              <div className="bg-purple-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-purple-500">NOL Metro</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-1">Monthly Cost</p>
                <p className="text-2xl font-bold text-slate-900">AED {results.nol.totalCost.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {results.nol.trips} trips × AED {results.nol.farePerTrip}
                </p>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-sm text-purple-700">Recommended Recharge: <strong>AED {results.nol.rechargeAmount}</strong></p>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-slate-900 text-white rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400">Total Monthly Transport Cost</p>
                  <p className="text-3xl font-bold">
                    AED {(results.salik.totalCost + results.mawaqif.totalCost + results.nol.totalCost).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Official Links */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Official Recharge Links</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://www.salik.ae"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Salik Recharge</p>
                <p className="text-sm text-slate-500">salik.ae</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
            </a>
            <a
              href="https://www.mawaqif.ae"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Mawaqif</p>
                <p className="text-sm text-slate-500">mawaqif.ae</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
            </a>
            <a
              href="https://www.rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=4800149"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">NOL Recharge</p>
                <p className="text-sm text-slate-500">rta.ae</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
            </a>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}