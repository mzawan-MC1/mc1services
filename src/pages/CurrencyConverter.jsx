import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ToolLayout from '../components/tools/ToolLayout';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू', flag: '🇳🇵' },
];

// Fallback rates (AED to currency) - used if API fails
const fallbackRates = {
  USD: 0.2723,
  EUR: 0.2512,
  GBP: 0.2152,
  INR: 22.72,
  PKR: 75.68,
  SAR: 1.0208,
  EGP: 13.45,
  PHP: 15.32,
  BDT: 32.58,
  NPR: 36.35,
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1000');
  const [toCurrency, setToCurrency] = useState('USD');
  const [rates, setRates] = useState(fallbackRates);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using exchangerate-api.com free tier
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/AED');
      const data = await response.json();
      if (data.rates) {
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch (err) {
      console.log('Using fallback rates');
      setError('Using offline rates. Live rates unavailable.');
      setRates(fallbackRates);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const convertedAmount = parseFloat(amount) * (rates[toCurrency] || 1);
  const selectedCurrency = currencies.find(c => c.code === toCurrency);

  const formatNumber = (num, decimals = 2) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AED Currency Converter",
    "description": "Convert UAE Dirhams (AED) to USD, EUR, GBP, INR, PKR, and other currencies with live exchange rates.",
    "applicationCategory": "FinanceApplication",
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
      title="AED Currency Converter"
      description="Convert UAE Dirhams to major world currencies with live exchange rates."
      icon={DollarSign}
      color="from-amber-600 to-orange-600"
      metaTitle="AED Currency Converter 2024 | UAE Dirham to USD, EUR, INR, PKR Exchange Rates"
      metaDescription="Free AED currency converter with live exchange rates. Convert UAE Dirhams to US Dollar, Euro, British Pound, Indian Rupee, Pakistani Rupee and more. Best exchange rates in UAE."
      schemaData={schemaData}
    >
      <div className="space-y-8">
        {/* Converter */}
        <div className="grid md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Amount (AED)</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">AED</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-14 text-lg font-semibold"
                placeholder="1000"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>Convert To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                      <span className="text-slate-500">- {c.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-100 mb-1">Converted Amount</p>
              <p className="text-4xl font-bold">
                {selectedCurrency?.symbol} {formatNumber(convertedAmount)}
              </p>
              <p className="text-amber-100 mt-2">
                {selectedCurrency?.flag} {selectedCurrency?.name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchRates}
              disabled={loading}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <p className="text-sm text-amber-100">
              1 AED = {selectedCurrency?.symbol} {rates[toCurrency]?.toFixed(4)}
            </p>
            {lastUpdated && (
              <p className="text-xs text-amber-200">Updated: {lastUpdated}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        {/* Quick Amounts */}
        <div>
          <Label className="mb-3 block">Quick Amounts</Label>
          <div className="flex flex-wrap gap-2">
            {[100, 500, 1000, 5000, 10000, 50000].map(amt => (
              <Button
                key={amt}
                variant={amount === String(amt) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAmount(String(amt))}
                className={amount === String(amt) ? 'text-white' : 'text-slate-700'}
              >
                AED {amt.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Conversion Table */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            AED {parseFloat(amount || 0).toLocaleString()} in Popular Currencies
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {currencies.map(currency => {
              const converted = parseFloat(amount || 0) * (rates[currency.code] || 0);
              return (
                <div
                  key={currency.code}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    currency.code === toCurrency ? 'bg-amber-50 border-2 border-amber-200' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currency.flag}</span>
                    <div>
                      <p className="font-medium">{currency.code}</p>
                      <p className="text-sm text-slate-500">{currency.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {currency.symbol} {formatNumber(converted)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Rate: {rates[currency.code]?.toFixed(4)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exchange Tips */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Exchange Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Best Rates</h4>
              <p className="text-sm text-blue-700">
                Exchange houses in areas like Bur Dubai, Deira, and Al Ain Center often offer better rates than banks.
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-semibold text-green-900 mb-2">No Commission</h4>
              <p className="text-sm text-green-700">
                Most UAE exchange houses don't charge commission. Always compare rates before exchanging large amounts.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-100 rounded-xl p-4 text-sm text-slate-600">
          <p>
            <strong>Disclaimer:</strong> Exchange rates are indicative and updated periodically. 
            Actual rates may vary at the time of transaction. This tool is for reference only.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}