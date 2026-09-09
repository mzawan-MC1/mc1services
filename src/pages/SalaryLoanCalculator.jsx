import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import ToolLayout from '../components/tools/ToolLayout';

const loanTypes = [
  { value: 'personal', label: 'Personal Loan', maxDBR: 50, rate: 4.5 },
  { value: 'auto', label: 'Auto Loan', maxDBR: 50, rate: 3.5 },
  { value: 'mortgage', label: 'Mortgage', maxDBR: 50, rate: 3.99 },
];

export default function SalaryLoanCalculator() {
  const [salary, setSalary] = useState('');
  const [liabilities, setLiabilities] = useState('');
  const [loanType, setLoanType] = useState('personal');
  const [tenure, setTenure] = useState([48]);
  const [result, setResult] = useState(null);

  const calculate = () => {
    const monthlySalary = parseFloat(salary) || 0;
    const existingLiabilities = parseFloat(liabilities) || 0;
    const selectedLoan = loanTypes.find(l => l.value === loanType);
    const tenureMonths = tenure[0];

    if (monthlySalary <= 0) return;

    // UAE DBR Calculation
    const maxDBR = selectedLoan.maxDBR / 100;
    const maxEMI = monthlySalary * maxDBR;
    const availableEMI = Math.max(0, maxEMI - existingLiabilities);
    const currentDBR = existingLiabilities / monthlySalary * 100;

    // Loan amount calculation using EMI formula
    const monthlyRate = selectedLoan.rate / 100 / 12;
    const maxLoanAmount = availableEMI * ((Math.pow(1 + monthlyRate, tenureMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)));

    // Approval likelihood
    let approval = 'Low';
    let approvalColor = 'bg-red-100 text-red-700';
    if (currentDBR < 30 && monthlySalary >= 5000) {
      approval = 'High';
      approvalColor = 'bg-green-100 text-green-700';
    } else if (currentDBR < 40 && monthlySalary >= 3000) {
      approval = 'Medium';
      approvalColor = 'bg-yellow-100 text-yellow-700';
    }

    setResult({
      maxLoan: Math.max(0, Math.round(maxLoanAmount)),
      emi: Math.round(availableEMI),
      dbr: currentDBR.toFixed(1),
      availableDBR: (maxDBR * 100 - currentDBR).toFixed(1),
      approval,
      approvalColor,
      rate: selectedLoan.rate
    });
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "UAE Salary to Loan Calculator",
    "description": "Free online calculator to determine your maximum loan eligibility in UAE based on salary, DBR (Debt Burden Ratio) rules, and existing liabilities.",
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
      title="UAE Salary to Loan Calculator"
      description="Calculate your maximum loan eligibility based on UAE banking DBR rules and existing liabilities."
      icon={Calculator}
      color="from-blue-600 to-cyan-600"
      metaTitle="UAE Salary to Loan Calculator 2024 | Free DBR & Loan Eligibility Calculator"
      metaDescription="Calculate your maximum loan amount in UAE based on your salary. Free online calculator using UAE Central Bank DBR rules. Check personal loan, auto loan, and mortgage eligibility instantly."
      schemaData={schemaData}
    >
      <div className="space-y-8">
        {/* Form */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="salary">Monthly Salary (AED) *</Label>
            <Input
              id="salary"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g., 15000"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="liabilities">Existing Monthly Liabilities (AED)</Label>
            <Input
              id="liabilities"
              type="number"
              value={liabilities}
              onChange={(e) => setLiabilities(e.target.value)}
              placeholder="e.g., 2000"
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">Credit cards, existing loans, etc.</p>
          </div>
          <div>
            <Label>Loan Type</Label>
            <Select value={loanType} onValueChange={setLoanType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {loanTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} ({type.rate}% p.a.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Loan Tenure: {tenure[0]} months</Label>
            <Slider
              value={tenure}
              onValueChange={setTenure}
              min={12}
              max={60}
              step={6}
              className="mt-4"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>12 months</span>
              <span>60 months</span>
            </div>
          </div>
        </div>

        <Button onClick={calculate} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-6 text-lg">
          Calculate Loan Eligibility
        </Button>

        {/* Results */}
        {result && (
          <div className="border-t pt-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Your Loan Eligibility</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-5">
                <p className="text-sm text-blue-600 mb-1">Maximum Loan Amount</p>
                <p className="text-2xl font-bold text-slate-900">AED {result.maxLoan.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-5">
                <p className="text-sm text-green-600 mb-1">Expected Monthly EMI</p>
                <p className="text-2xl font-bold text-slate-900">AED {result.emi.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-5">
                <p className="text-sm text-purple-600 mb-1">Current DBR</p>
                <p className="text-2xl font-bold text-slate-900">{result.dbr}%</p>
                <p className="text-xs text-slate-500">Available: {result.availableDBR}%</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-slate-600 mb-1">Approval Likelihood</p>
                <Badge className={`${result.approvalColor} text-lg px-3 py-1`}>
                  {result.approval}
                </Badge>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Important Notes</p>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  <li>• UAE banks typically allow maximum 50% DBR (Debt Burden Ratio)</li>
                  <li>• Minimum salary requirements vary by bank (AED 3,000 - 5,000)</li>
                  <li>• Actual rates may vary based on credit score and employer</li>
                  <li>• This is an estimate - final approval depends on bank assessment</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* DBR Explanation */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Understanding DBR (Debt Burden Ratio)</h3>
          <p className="text-slate-600 mb-4">
            The Debt Burden Ratio is the percentage of your monthly income that goes toward debt repayments. 
            UAE Central Bank regulations cap this at 50% for most loans.
          </p>
          <div className="bg-slate-100 rounded-lg p-4">
            <code className="text-sm">
              DBR = (Total Monthly Debt Payments / Monthly Salary) × 100
            </code>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}