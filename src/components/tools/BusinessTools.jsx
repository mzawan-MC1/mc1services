import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton, ResetButton, SavePrefsButton, loadPrefs, ShareButtons } from './ToolHelpers';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function BusinessTools({ activeTool }) {
  // Gratuity
  const [basicSalary, setBasicSalary] = useState('8000');
  const [yearsWorked, setYearsWorked] = useState('5');
  const [contractType, setContractType] = useState('unlimited');
  const [resignationType, setResignationType] = useState('voluntary');

  // Mortgage
  const [monthlyIncome, setMonthlyIncome] = useState('25000');
  const [existingEmi, setExistingEmi] = useState('2000');
  const [downPayment, setDownPayment] = useState('200000');
  const [mortgageRate, setMortgageRate] = useState('4.5');
  const [mortgageTerm, setMortgageTerm] = useState('25');

  // Personal Loan
  const [loanSalary, setLoanSalary] = useState('15000');
  const [loanLiabilities, setLoanLiabilities] = useState('2000');
  const [loanTenure, setLoanTenure] = useState('48');

  // Visa Overstay
  const [visaType, setVisaType] = useState('visit');
  const [overstayDays, setOverstayDays] = useState('15');

  // Currency with live rates
  const [aedAmount, setAedAmount] = useState('1000');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [liveRates, setLiveRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load saved preferences
  useEffect(() => {
    const loanPrefs = loadPrefs('business-loan');
    if (loanPrefs) {
      if (loanPrefs.loanSalary) setLoanSalary(loanPrefs.loanSalary);
      if (loanPrefs.loanLiabilities) setLoanLiabilities(loanPrefs.loanLiabilities);
    }
    const currencyPrefs = loadPrefs('business-currency');
    if (currencyPrefs) {
      if (currencyPrefs.targetCurrency) setTargetCurrency(currencyPrefs.targetCurrency);
    }
  }, []);

  // Fetch live exchange rates
  const fetchLiveRates = async () => {
    setRatesLoading(true);
    setRatesError(null);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/AED');
      const data = await response.json();
      setLiveRates(data.rates);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (_error) {
      setRatesError('Could not fetch live rates. Using fallback rates.');
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTool === 'currency') {
      fetchLiveRates();
    }
  }, [activeTool]);

  const exchangeRates = {
    USD: { rate: 0.2723, symbol: '$', name: 'US Dollar' },
    EUR: { rate: 0.2512, symbol: '€', name: 'Euro' },
    GBP: { rate: 0.2152, symbol: '£', name: 'British Pound' },
    INR: { rate: 22.72, symbol: '₹', name: 'Indian Rupee' },
    PKR: { rate: 75.68, symbol: '₨', name: 'Pakistani Rupee' },
    PHP: { rate: 15.32, symbol: '₱', name: 'Philippine Peso' },
    SAR: { rate: 1.0208, symbol: 'ر.س', name: 'Saudi Riyal' },
    EGP: { rate: 13.45, symbol: 'E£', name: 'Egyptian Pound' },
  };

  if (activeTool === 'gratuity') {
    const salary = parseFloat(basicSalary) || 0;
    const years = parseFloat(yearsWorked) || 0;
    let gratuity = 0;

    if (years < 1) {
      gratuity = 0;
    } else if (years <= 5) {
      gratuity = (salary / 30) * 21 * years;
    } else {
      const first5 = (salary / 30) * 21 * 5;
      const remaining = (salary / 30) * 30 * (years - 5);
      gratuity = first5 + remaining;
    }

    // Resignation adjustments for unlimited contracts
    if (contractType === 'unlimited' && resignationType === 'voluntary') {
      if (years < 1) gratuity = 0;
      else if (years < 3) gratuity = gratuity * (1/3);
      else if (years < 5) gratuity = gratuity * (2/3);
    }

    const results = { 'Gratuity': `AED ${gratuity.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">UAE Gratuity Calculator</h3>
          <ShareButtons toolId="gratuity" toolName="Gratuity Calculator" results={results} inputs={{ basicSalary, yearsWorked }} />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><Label>Basic Salary (AED)</Label><Input type="number" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} className="mt-2" /></div>
          <div><Label>Years Worked</Label><Input type="number" step="0.5" value={yearsWorked} onChange={e => setYearsWorked(e.target.value)} className="mt-2" /></div>
          <div><Label>Contract Type</Label>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="limited">Limited</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Resignation Type</Label>
            <Select value={resignationType} onValueChange={setResignationType}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="voluntary">Voluntary (Resignation)</SelectItem>
                <SelectItem value="termination">Termination by Employer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 text-center relative group">
          <p className="text-sm text-green-600">Estimated End-of-Service Gratuity</p>
          <p className="text-4xl font-bold">AED {gratuity.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
          <div className="mt-3">
            <CopyButton value={gratuity.toFixed(0)} label="Copy Amount" />
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
          <p><strong>Note:</strong> First 5 years: 21 days salary per year. After 5 years: 30 days salary per year. Max gratuity = 2 years&apos; salary.</p>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setBasicSalary('8000'); setYearsWorked('5'); setContractType('unlimited'); setResignationType('voluntary'); }} />
          <SavePrefsButton toolId="business-gratuity" values={{ basicSalary }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'mortgage') {
    const income = parseFloat(monthlyIncome) || 0;
    const emi = parseFloat(existingEmi) || 0;
    const dp = parseFloat(downPayment) || 0;
    const rate = parseFloat(mortgageRate) / 100 / 12;
    const term = parseFloat(mortgageTerm) * 12;

    const maxDBR = 0.5;
    const maxEmi = income * maxDBR - emi;
    const maxLoan = maxEmi * ((Math.pow(1 + rate, term) - 1) / (rate * Math.pow(1 + rate, term)));
    const totalProperty = maxLoan + dp;
    const monthlyPayment = maxEmi;

    const results = { 'Max Loan': `AED ${maxLoan.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, 'Property': `AED ${totalProperty.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Mortgage Affordability Calculator</h3>
          <ShareButtons toolId="mortgage" toolName="Mortgage Calculator" results={results} inputs={{ monthlyIncome, existingEmi, downPayment, mortgageRate, mortgageTerm }} />
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div><Label>Monthly Income (AED)</Label><Input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} className="mt-2" /></div>
          <div><Label>Existing EMIs (AED)</Label><Input type="number" value={existingEmi} onChange={e => setExistingEmi(e.target.value)} className="mt-2" /></div>
          <div><Label>Down Payment (AED)</Label><Input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className="mt-2" /></div>
          <div><Label>Interest Rate (%)</Label><Input type="number" step="0.1" value={mortgageRate} onChange={e => setMortgageRate(e.target.value)} className="mt-2" /></div>
          <div><Label>Term (Years)</Label><Input type="number" value={mortgageTerm} onChange={e => setMortgageTerm(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-blue-600">Max Loan Amount</p>
            <p className="text-2xl font-bold">AED {maxLoan.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={maxLoan.toFixed(0)} label="" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-green-600">Property You Can Afford</p>
            <p className="text-2xl font-bold">AED {totalProperty.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={totalProperty.toFixed(0)} label="" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-purple-600">Monthly Payment</p>
            <p className="text-2xl font-bold">AED {monthlyPayment.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={monthlyPayment.toFixed(0)} label="" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setMonthlyIncome('25000'); setExistingEmi('2000'); setDownPayment('200000'); setMortgageRate('4.5'); setMortgageTerm('25'); }} />
          <SavePrefsButton toolId="business-mortgage" values={{ monthlyIncome }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'loan') {
    const salary = parseFloat(loanSalary) || 0;
    const liabilities = parseFloat(loanLiabilities) || 0;
    const tenure = parseFloat(loanTenure) || 48;
    const rate = 0.045 / 12; // 4.5% annual

    const maxDBR = 0.5;
    const maxEmi = salary * maxDBR - liabilities;
    const maxLoan = maxEmi > 0 ? maxEmi * ((Math.pow(1 + rate, tenure) - 1) / (rate * Math.pow(1 + rate, tenure))) : 0;
    const currentDBR = (liabilities / salary) * 100;

    let eligibility = 'High';
    let color = 'bg-green-50 text-green-700';
    if (currentDBR > 40) { eligibility = 'Low'; color = 'bg-red-50 text-red-700'; }
    else if (currentDBR > 30) { eligibility = 'Medium'; color = 'bg-yellow-50 text-yellow-700'; }

    const results = { 'Max Loan': `AED ${maxLoan.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, 'DBR': `${currentDBR.toFixed(1)}%` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Personal Loan Eligibility Calculator</h3>
          <ShareButtons toolId="loan" toolName="Loan Calculator" results={results} inputs={{ loanSalary, loanLiabilities, loanTenure }} />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div><Label>Monthly Salary (AED)</Label><Input type="number" value={loanSalary} onChange={e => setLoanSalary(e.target.value)} className="mt-2" /></div>
          <div><Label>Existing Liabilities (AED)</Label><Input type="number" value={loanLiabilities} onChange={e => setLoanLiabilities(e.target.value)} className="mt-2" /></div>
          <div><Label>Loan Tenure (Months)</Label><Input type="number" value={loanTenure} onChange={e => setLoanTenure(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-blue-600">Max Loan</p>
            <p className="text-2xl font-bold">AED {maxLoan.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={maxLoan.toFixed(0)} label="" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-sm text-green-600">Max EMI</p><p className="text-2xl font-bold">AED {maxEmi.toFixed(0)}</p></div>
          <div className="bg-purple-50 rounded-xl p-4 text-center"><p className="text-sm text-purple-600">Current DBR</p><p className="text-2xl font-bold">{currentDBR.toFixed(1)}%</p></div>
          <div className={`rounded-xl p-4 text-center ${color}`}><p className="text-sm">Eligibility</p><p className="text-2xl font-bold">{eligibility}</p></div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setLoanSalary('15000'); setLoanLiabilities('2000'); setLoanTenure('48'); }} />
          <SavePrefsButton toolId="business-loan" values={{ loanSalary, loanLiabilities }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'visa') {
    const days = parseInt(overstayDays) || 0;
    const visaRules = {
      visit: { grace: 10, finePerDay: 100, maxFine: 50000 },
      tourist: { grace: 10, finePerDay: 100, maxFine: 50000 },
      residence: { grace: 30, finePerDay: 125, maxFine: 50000 },
      employment: { grace: 30, finePerDay: 125, maxFine: 50000 },
    };
    const rule = visaRules[visaType];
    const fineDays = Math.max(0, days - rule.grace);
    const fine = Math.min(fineDays * rule.finePerDay, rule.maxFine);

    const results = { 'Fine': `AED ${fine.toLocaleString()}`, 'Days': fineDays };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Visa Overstay Fine Estimator</h3>
          <ShareButtons toolId="visa" toolName="Visa Fine Calculator" results={results} inputs={{ visaType, overstayDays }} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Visa Type</Label>
            <Select value={visaType} onValueChange={setVisaType}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="visit">Visit Visa</SelectItem>
                <SelectItem value="tourist">Tourist Visa</SelectItem>
                <SelectItem value="residence">Residence Visa</SelectItem>
                <SelectItem value="employment">Employment Visa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Days Since Visa Expired</Label><Input type="number" value={overstayDays} onChange={e => setOverstayDays(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center"><p className="text-sm text-slate-600">Grace Period</p><p className="text-2xl font-bold">{rule.grace} days</p></div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center"><p className="text-sm text-yellow-600">Chargeable Days</p><p className="text-2xl font-bold">{fineDays} days</p></div>
          <div className="bg-red-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-red-600">Estimated Fine</p>
            <p className="text-2xl font-bold">AED {fine.toLocaleString()}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={fine.toString()} label="" />
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500">⚠️ This is an estimate. Contact GDRFA for exact fines.</p>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setVisaType('visit'); setOverstayDays('15'); }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'currency') {
    const amount = parseFloat(aedAmount) || 0;

    // Use live rates if available, otherwise fallback
    const ratesData = liveRates ? {
      USD: { rate: liveRates.USD, symbol: '$', name: 'US Dollar' },
      EUR: { rate: liveRates.EUR, symbol: '€', name: 'Euro' },
      GBP: { rate: liveRates.GBP, symbol: '£', name: 'British Pound' },
      INR: { rate: liveRates.INR, symbol: '₹', name: 'Indian Rupee' },
      PKR: { rate: liveRates.PKR, symbol: '₨', name: 'Pakistani Rupee' },
      PHP: { rate: liveRates.PHP, symbol: '₱', name: 'Philippine Peso' },
      SAR: { rate: liveRates.SAR, symbol: 'ر.س', name: 'Saudi Riyal' },
      EGP: { rate: liveRates.EGP, symbol: 'E£', name: 'Egyptian Pound' },
    } : exchangeRates;

    const converted = amount * (ratesData[targetCurrency]?.rate || 0);
    const results = { 'Converted': `${ratesData[targetCurrency]?.symbol} ${converted.toFixed(2)}` };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xl font-bold">AED Currency Converter</h3>
          <div className="flex items-center gap-2">
            <ShareButtons toolId="currency" toolName="Currency Converter" results={results} inputs={{ aedAmount, targetCurrency }} />
            {lastUpdated && <span className="text-xs text-green-600">Live • Updated {lastUpdated}</span>}
            <Button variant="outline" size="sm" onClick={fetchLiveRates} disabled={ratesLoading}>
              {ratesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {ratesError && <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">{ratesError}</p>}
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Amount (AED)</Label><Input type="number" value={aedAmount} onChange={e => setAedAmount(e.target.value)} className="mt-2" /></div>
          <div><Label>Convert To</Label>
            <Select value={targetCurrency} onValueChange={setTargetCurrency}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ratesData).map(([code, { name }]) => (
                  <SelectItem key={code} value={code}>{code} - {name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-6 text-center relative">
          <p className="text-amber-100 mb-1">Converted Amount</p>
          <p className="text-4xl font-bold">{ratesData[targetCurrency]?.symbol} {converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
          <p className="text-sm text-amber-100 mt-2">Rate: 1 AED = {ratesData[targetCurrency]?.rate?.toFixed(4)} {targetCurrency}</p>
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(converted.toFixed(2)); }} className="bg-white/20 hover:bg-white/30 text-white">
              Copy Result
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(ratesData).map(([code, { rate, symbol, name }]) => (
            <div key={code} className="bg-slate-50 rounded-lg p-3 text-center relative group">
              <p className="text-xs text-slate-500">{name}</p>
              <p className="font-bold">{symbol} {(amount * rate).toFixed(2)}</p>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton value={(amount * rate).toFixed(2)} label="" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">* {liveRates ? 'Live rates from ExchangeRate-API' : 'Fallback rates - live rates unavailable'}. Actual bank rates may vary.</p>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setAedAmount('1000'); setTargetCurrency('USD'); }} />
          <SavePrefsButton toolId="business-currency" values={{ targetCurrency }} />
        </div>
      </div>
    );
  }

  return null;
}
