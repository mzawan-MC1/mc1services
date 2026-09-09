import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CopyButton, ResetButton, SavePrefsButton, loadPrefs, ShareButtons } from './ToolHelpers';

export default function VisitorTools({ activeTool }) {
  // Itinerary
  const [tripDays, setTripDays] = useState('5');
  const [interests, setInterests] = useState(['culture', 'shopping']);
  const [budget, setBudget] = useState('medium');

  // Load saved preferences
  useEffect(() => {
    const prefs = loadPrefs('visitor-itinerary');
    if (prefs) {
      if (prefs.tripDays) setTripDays(prefs.tripDays);
      if (prefs.interests) setInterests(prefs.interests);
      if (prefs.budget) setBudget(prefs.budget);
    }
  }, []);

  // Tickets
  const [attractions, setAttractions] = useState({ burjKhalifa: true, dubaiMall: false, palmJumeirah: true, miracleGarden: false, frameMuseum: true });

  // Transport
  const [tripDistance, setTripDistance] = useState('15');
  const [tripsPerDay, setTripsPerDay] = useState('4');
  const [stayDays, setStayDays] = useState('5');

  // Best Time
  const [activity, setActivity] = useState('beach');

  // Packing
  const [packingMonth, setPackingMonth] = useState('december');
  const [packingPurpose, setPackingPurpose] = useState('leisure');

  const interestOptions = ['culture', 'shopping', 'adventure', 'beach', 'nightlife', 'family'];
  const attractionPrices = {
    burjKhalifa: { name: 'Burj Khalifa (At the Top)', price: 169 },
    dubaiMall: { name: 'Dubai Aquarium', price: 135 },
    palmJumeirah: { name: 'Palm View Observatory', price: 79 },
    miracleGarden: { name: 'Miracle Garden', price: 55 },
    frameMuseum: { name: 'Dubai Frame', price: 52 },
  };

  if (activeTool === 'itinerary') {
    const days = parseInt(tripDays) || 5;
    const itineraries = {
      culture: ['Visit Dubai Museum & Al Fahidi', 'Explore Jumeirah Mosque', 'Tour Sheikh Zayed Mosque (Abu Dhabi)', 'Gold & Spice Souks', 'Etihad Museum'],
      shopping: ['Dubai Mall Shopping', 'Mall of the Emirates', 'Global Village', 'Ibn Battuta Mall', 'City Walk'],
      adventure: ['Desert Safari', 'Skydiving at Palm', 'Jet Ski at JBR', 'Hatta Mountain Trip', 'Indoor Skiing'],
      beach: ['JBR Beach Day', 'Kite Beach', 'La Mer', 'Palm Beach', 'Sunset at Marina'],
      nightlife: ['Marina Walk', 'JBR Night Life', 'Burj Khalifa Light Show', 'Dinner Cruise', 'DIFC Nightlife'],
      family: ['Dubai Parks & Resorts', 'Aquaventure', 'Legoland', 'IMG Worlds', 'KidZania'],
    };
    const selectedActivities = interests.flatMap(i => itineraries[i] || []);
    const dayPlan = [];
    for (let i = 0; i < days; i++) {
      dayPlan.push({
        day: i + 1,
        activities: selectedActivities.slice(i * 2, i * 2 + 2).length > 0 
          ? selectedActivities.slice(i * 2, i * 2 + 2) 
          : ['Free exploration day']
      });
    }
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Trip Itinerary Generator</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Number of Days</Label><Input type="number" min="1" max="14" value={tripDays} onChange={e => setTripDays(e.target.value)} className="mt-2" /></div>
          <div><Label>Budget Level</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="mb-3 block">Your Interests</Label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map(int => (
              <Button key={int} size="sm" variant={interests.includes(int) ? 'default' : 'outline'}
                onClick={() => setInterests(prev => prev.includes(int) ? prev.filter(i => i !== int) : [...prev, int])}
                className={`capitalize ${interests.includes(int) ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}>{int}</Button>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Your {days}-Day Itinerary</h4>
            <CopyButton value={dayPlan.map(d => `Day ${d.day}: ${d.activities.join(', ')}`).join('\n')} label="Copy" />
          </div>
          <div className="space-y-3">
            {dayPlan.map(d => (
              <div key={d.day} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{d.day}</div>
                <div>
                  <p className="font-medium">Day {d.day}</p>
                  <ul className="text-sm text-slate-600">{d.activities.map((a, i) => <li key={i}>• {a}</li>)}</ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setTripDays('5'); setInterests(['culture', 'shopping']); setBudget('medium'); }} />
          <SavePrefsButton toolId="visitor-itinerary" values={{ tripDays, interests, budget }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'tickets') {
    const selected = Object.entries(attractions).filter(([_, v]) => v);
    const total = selected.reduce((sum, [k]) => sum + attractionPrices[k].price, 0);
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Attractions Ticket Budget Estimator</h3>
        <div className="space-y-3">
          {Object.entries(attractionPrices).map(([key, { name, price }]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox checked={attractions[key]} onCheckedChange={c => setAttractions({...attractions, [key]: c})} />
                <span>{name}</span>
              </div>
              <Badge variant="secondary">AED {price}</Badge>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 rounded-xl p-6 text-center relative group">
          <p className="text-sm text-blue-600">Total Budget Needed</p>
          <p className="text-4xl font-bold">AED {total}</p>
          <p className="text-sm text-slate-500 mt-2">{selected.length} attractions selected</p>
          <div className="mt-3">
            <CopyButton value={`AED ${total}`} label="Copy Total" />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => setAttractions({ burjKhalifa: false, dubaiMall: false, palmJumeirah: false, miracleGarden: false, frameMuseum: false })} />
        </div>
      </div>
    );
  }

  if (activeTool === 'transit') {
    const dist = parseFloat(tripDistance) || 10;
    const trips = parseFloat(tripsPerDay) || 4;
    const days = parseFloat(stayDays) || 5;
    const metroPerTrip = dist > 10 ? 7.5 : (dist > 5 ? 5 : 3);
    const taxiPerTrip = 12 + (dist * 1.96);
    const metroTotal = metroPerTrip * trips * days;
    const taxiTotal = taxiPerTrip * trips * days;
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Public Transport vs Taxi Cost Estimator</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><Label>Avg Distance/Trip (km)</Label><Input type="number" value={tripDistance} onChange={e => setTripDistance(e.target.value)} className="mt-2" /></div>
          <div><Label>Trips per Day</Label><Input type="number" value={tripsPerDay} onChange={e => setTripsPerDay(e.target.value)} className="mt-2" /></div>
          <div><Label>Stay Duration (days)</Label><Input type="number" value={stayDays} onChange={e => setStayDays(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <p className="text-sm text-green-600">Metro/Bus Total</p>
            <p className="text-3xl font-bold">AED {metroTotal.toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2">~AED {metroPerTrip}/trip</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 text-center">
            <p className="text-sm text-yellow-600">Taxi Total</p>
            <p className="text-3xl font-bold">AED {taxiTotal.toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2">~AED {taxiPerTrip.toFixed(0)}/trip</p>
          </div>
        </div>
        <p className="text-sm text-green-600">💡 You save AED {(taxiTotal - metroTotal).toFixed(0)} using public transport!</p>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <CopyButton value={`Metro: AED ${metroTotal.toFixed(0)}, Taxi: AED ${taxiTotal.toFixed(0)}, Savings: AED ${(taxiTotal - metroTotal).toFixed(0)}`} label="Copy Results" />
          <ResetButton onReset={() => { setTripDistance('15'); setTripsPerDay('4'); setStayDays('5'); }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'timing') {
    const recommendations = {
      beach: { best: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'], avoid: ['Jun', 'Jul', 'Aug'], tip: 'Winter months offer pleasant 25°C weather perfect for beach activities.' },
      shopping: { best: ['Jan', 'Jun', 'Dec'], avoid: [], tip: 'DSF (Jan) and DSS (Jun-Aug) offer massive discounts.' },
      outdoor: { best: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'], avoid: ['Jun', 'Jul', 'Aug'], tip: 'Avoid summer heat (40°C+) for outdoor activities.' },
      events: { best: ['Nov', 'Dec', 'Jan', 'Feb'], avoid: [], tip: 'F1, Dubai Expo, and major events happen in winter.' },
    };
    const rec = recommendations[activity] || recommendations.beach;
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Best Time to Visit Dubai</h3>
        <div><Label>What do you want to do?</Label>
          <Select value={activity} onValueChange={setActivity}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="beach">Beach & Water Activities</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="outdoor">Outdoor Exploration</SelectItem>
              <SelectItem value="events">Events & Festivals</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-semibold text-green-700 mb-2">✓ Best Months</p>
            <div className="flex flex-wrap gap-2">{rec.best.map(m => <Badge key={m} className="bg-green-500">{m}</Badge>)}</div>
          </div>
          {rec.avoid.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="font-semibold text-red-700 mb-2">✗ Avoid</p>
              <div className="flex flex-wrap gap-2">{rec.avoid.map(m => <Badge key={m} variant="destructive">{m}</Badge>)}</div>
            </div>
          )}
        </div>
        <div className="bg-blue-50 rounded-xl p-4"><p className="text-blue-700">💡 {rec.tip}</p></div>
      </div>
    );
  }

  if (activeTool === 'packing') {
    const winterItems = ['Light jacket', 'Sweater', 'Long pants', 'Closed shoes'];
    const summerItems = ['Sunscreen SPF50+', 'Hat', 'Light breathable clothes', 'Sunglasses'];
    const essentials = ['Passport', 'UAE Visa (if required)', 'Travel insurance', 'Phone charger', 'Cash (AED)', 'Credit card'];
    const beachItems = ['Swimwear', 'Beach towel', 'Flip flops', 'Cover-up'];
    const businessItems = ['Formal attire', 'Business cards', 'Laptop', 'Presentation materials'];
    
    const isWinter = ['october', 'november', 'december', 'january', 'february', 'march'].includes(packingMonth);
    const weatherItems = isWinter ? winterItems : summerItems;
    const purposeItems = packingPurpose === 'business' ? businessItems : beachItems;
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Packing Checklist Generator</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Travel Month</Label>
            <Select value={packingMonth} onValueChange={setPackingMonth}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].map(m => (
                  <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Trip Purpose</Label>
            <Select value={packingPurpose} onValueChange={setPackingPurpose}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="leisure">Leisure/Tourism</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="font-semibold mb-3">📋 Essentials</h4>
            <ul className="space-y-2">{essentials.map(i => <li key={i} className="text-sm flex items-center gap-2"><Checkbox id={`ess-${i}`} /><label htmlFor={`ess-${i}`} className="cursor-pointer">{i}</label></li>)}</ul>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold mb-3">🌡️ Weather ({isWinter ? 'Winter' : 'Summer'})</h4>
            <ul className="space-y-2">{weatherItems.map(i => <li key={i} className="text-sm flex items-center gap-2"><Checkbox id={`weather-${i}`} /><label htmlFor={`weather-${i}`} className="cursor-pointer">{i}</label></li>)}</ul>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-semibold mb-3">{packingPurpose === 'business' ? '💼 Business' : '🏖️ Beach/Leisure'}</h4>
            <ul className="space-y-2">{purposeItems.map(i => <li key={i} className="text-sm flex items-center gap-2"><Checkbox id={`purpose-${i}`} /><label htmlFor={`purpose-${i}`} className="cursor-pointer">{i}</label></li>)}</ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}