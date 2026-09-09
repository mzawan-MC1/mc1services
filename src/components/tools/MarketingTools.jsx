import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { CopyButton, ResetButton, ShareButtons } from './ToolHelpers';

export default function MarketingTools({ activeTool }) {
  // Ad Size Guide
  const [adPlatform, setAdPlatform] = useState('all');
  const [searchAdSize, setSearchAdSize] = useState('');
  // Budget Split Calculator
  const [totalBudget, setTotalBudget] = useState('10000');
  const [testingPercent, setTestingPercent] = useState([20]);
  const [channels, setChannels] = useState({ google: 40, meta: 35, linkedin: 15, other: 10 });

  // ROAS Calculator
  const [adSpend, setAdSpend] = useState('5000');
  const [revenue, setRevenue] = useState('15000');
  const [cogs, setCogs] = useState('6000');

  // CPM/CPC Calculator
  const [impressions, setImpressions] = useState('100000');
  const [clicks, setClicks] = useState('2000');
  const [cost, setCost] = useState('1000');
  const [conversions, setConversions] = useState('50');

  // Engagement Calculator
  const [followers, setFollowers] = useState('10000');
  const [likes, setLikes] = useState('500');
  const [comments, setComments] = useState('50');
  const [shares, setShares] = useState('20');

  // UTM Builder
  const [baseUrl, setBaseUrl] = useState('https://example.com');
  const [utmSource, setUtmSource] = useState('google');
  const [utmMedium, setUtmMedium] = useState('cpc');
  const [utmCampaign, setUtmCampaign] = useState('summer_sale');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (activeTool === 'budget-split') {
    const budget = parseFloat(totalBudget) || 0;
    const testing = budget * (testingPercent[0] / 100);
    const alwaysOn = budget - testing;
    const results = { 'Testing Budget': `AED ${testing.toLocaleString()}`, 'Always-On': `AED ${alwaysOn.toLocaleString()}` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Marketing Budget Split Calculator</h3>
          <ShareButtons toolId="budget-split" toolName="Budget Calculator" results={results} inputs={{ totalBudget, testingPercent: testingPercent[0] }} />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Total Monthly Budget (AED)</Label>
            <Input type="number" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label>Testing Budget: {testingPercent}%</Label>
            <Slider value={testingPercent} onValueChange={setTestingPercent} min={0} max={50} className="mt-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(channels).map(([ch, pct]) => (
            <div key={ch}>
              <Label className="capitalize">{ch} (%)</Label>
              <Input type="number" value={pct} onChange={e => setChannels({...channels, [ch]: parseInt(e.target.value) || 0})} className="mt-1" />
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-sm text-purple-600">Testing Budget</p>
            <p className="text-2xl font-bold">AED {testing.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-600">Always-On Budget</p>
            <p className="text-2xl font-bold">AED {alwaysOn.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold">Channel Distribution (Always-On)</p>
            <CopyButton value={Object.entries(channels).map(([ch, pct]) => `${ch}: AED ${(alwaysOn * pct / 100).toLocaleString()}`).join(', ')} label="Copy" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(channels).map(([ch, pct]) => (
              <div key={ch} className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 capitalize">{ch}</p>
                <p className="font-bold">AED {(alwaysOn * pct / 100).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setTotalBudget('10000'); setTestingPercent([20]); setChannels({ google: 40, meta: 35, linkedin: 15, other: 10 }); }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'roas') {
    const spend = parseFloat(adSpend) || 0;
    const rev = parseFloat(revenue) || 0;
    const cost = parseFloat(cogs) || 0;
    const roas = spend > 0 ? (rev / spend).toFixed(2) : 0;
    const profit = rev - cost - spend;
    const profitMargin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : 0;
    const results = { 'ROAS': `${roas}x`, 'Profit': `AED ${profit.toLocaleString()}`, 'Margin': `${profitMargin}%` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">ROAS & Profit Calculator</h3>
          <ShareButtons toolId="roas" toolName="ROAS Calculator" results={results} inputs={{ adSpend, revenue, cogs }} />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div><Label>Ad Spend (AED)</Label><Input type="number" value={adSpend} onChange={e => setAdSpend(e.target.value)} className="mt-2" /></div>
          <div><Label>Revenue Generated (AED)</Label><Input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} className="mt-2" /></div>
          <div><Label>Cost of Goods (AED)</Label><Input type="number" value={cogs} onChange={e => setCogs(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center relative group">
            <p className="text-sm text-blue-600">ROAS</p>
            <p className="text-3xl font-bold">{roas}x</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={roas} label="" />
            </div>
          </div>
          <div className={`rounded-xl p-4 text-center relative group ${profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Net Profit</p>
            <p className="text-3xl font-bold">AED {profit.toLocaleString()}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={profit.toString()} label="" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-sm text-purple-600">Profit Margin</p>
            <p className="text-3xl font-bold">{profitMargin}%</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <CopyButton value={`ROAS: ${roas}x, Profit: AED ${profit.toLocaleString()}, Margin: ${profitMargin}%`} label="Copy Results" />
          <ResetButton onReset={() => { setAdSpend('5000'); setRevenue('15000'); setCogs('6000'); }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'cpm-cpc') {
    const imp = parseFloat(impressions) || 0;
    const clk = parseFloat(clicks) || 0;
    const cst = parseFloat(cost) || 0;
    const conv = parseFloat(conversions) || 0;
    const cpm = imp > 0 ? ((cst / imp) * 1000).toFixed(2) : 0;
    const cpc = clk > 0 ? (cst / clk).toFixed(2) : 0;
    const ctr = imp > 0 ? ((clk / imp) * 100).toFixed(2) : 0;
    const cpa = conv > 0 ? (cst / conv).toFixed(2) : 0;
    const cvr = clk > 0 ? ((conv / clk) * 100).toFixed(2) : 0;
    const results = { CPM: `AED ${cpm}`, CPC: `AED ${cpc}`, CTR: `${ctr}%`, CPA: `AED ${cpa}`, CVR: `${cvr}%` };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">CPM / CPC / CTR / CPA Calculator</h3>
          <ShareButtons toolId="cpm-cpc" toolName="Ad Metrics Calculator" results={results} inputs={{ impressions, clicks, cost, conversions }} />
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          <div><Label>Impressions</Label><Input type="number" value={impressions} onChange={e => setImpressions(e.target.value)} className="mt-2" /></div>
          <div><Label>Clicks</Label><Input type="number" value={clicks} onChange={e => setClicks(e.target.value)} className="mt-2" /></div>
          <div><Label>Cost (AED)</Label><Input type="number" value={cost} onChange={e => setCost(e.target.value)} className="mt-2" /></div>
          <div><Label>Conversions</Label><Input type="number" value={conversions} onChange={e => setConversions(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center relative group">
            <p className="text-xs text-blue-600">CPM</p>
            <p className="text-xl font-bold">AED {cpm}</p>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={cpm} label="" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center relative group">
            <p className="text-xs text-green-600">CPC</p>
            <p className="text-xl font-bold">AED {cpc}</p>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={cpc} label="" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center"><p className="text-xs text-purple-600">CTR</p><p className="text-xl font-bold">{ctr}%</p></div>
          <div className="bg-orange-50 rounded-xl p-4 text-center relative group">
            <p className="text-xs text-orange-600">CPA</p>
            <p className="text-xl font-bold">AED {cpa}</p>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={cpa} label="" />
            </div>
          </div>
          <div className="bg-pink-50 rounded-xl p-4 text-center"><p className="text-xs text-pink-600">CVR</p><p className="text-xl font-bold">{cvr}%</p></div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <CopyButton value={`CPM: AED ${cpm}, CPC: AED ${cpc}, CTR: ${ctr}%, CPA: AED ${cpa}, CVR: ${cvr}%`} label="Copy All" />
          <ResetButton onReset={() => { setImpressions('100000'); setClicks('2000'); setCost('1000'); setConversions('50'); }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'engagement') {
    const foll = parseFloat(followers) || 1;
    const totalEngagement = (parseFloat(likes) || 0) + (parseFloat(comments) || 0) + (parseFloat(shares) || 0);
    const rate = ((totalEngagement / foll) * 100).toFixed(2);
    let quality = 'Low';
    let color = 'text-red-600 bg-red-50';
    if (rate >= 3) { quality = 'Good'; color = 'text-green-600 bg-green-50'; }
    else if (rate >= 1) { quality = 'Average'; color = 'text-yellow-600 bg-yellow-50'; }
    const results = { 'Engagement Rate': `${rate}%`, 'Performance': quality };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Social Media Engagement Rate Calculator</h3>
          <ShareButtons toolId="engagement" toolName="Engagement Calculator" results={results} inputs={{ followers, likes, comments, shares }} />
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div><Label>Followers</Label><Input type="number" value={followers} onChange={e => setFollowers(e.target.value)} className="mt-2" /></div>
          <div><Label>Likes</Label><Input type="number" value={likes} onChange={e => setLikes(e.target.value)} className="mt-2" /></div>
          <div><Label>Comments</Label><Input type="number" value={comments} onChange={e => setComments(e.target.value)} className="mt-2" /></div>
          <div><Label>Shares</Label><Input type="number" value={shares} onChange={e => setShares(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-6 text-center relative group">
            <p className="text-sm text-blue-600 mb-2">Engagement Rate</p>
            <p className="text-4xl font-bold">{rate}%</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton value={rate} label="" />
            </div>
          </div>
          <div className={`rounded-xl p-6 text-center ${color}`}>
            <p className="text-sm mb-2">Performance</p>
            <p className="text-4xl font-bold">{quality}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500">Formula: (Likes + Comments + Shares) / Followers × 100</p>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setFollowers('10000'); setLikes('500'); setComments('50'); setShares('20'); }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'utm') {
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmTerm) params.set('utm_term', utmTerm);
    if (utmContent) params.set('utm_content', utmContent);
    const fullUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">UTM Link Builder</h3>
          <ShareButtons toolId="utm" toolName="UTM Builder" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Label>Website URL *</Label><Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="mt-2" placeholder="https://yoursite.com/page" /></div>
          <div><Label>Source * (e.g., google, facebook)</Label><Input value={utmSource} onChange={e => setUtmSource(e.target.value)} className="mt-2" /></div>
          <div><Label>Medium * (e.g., cpc, email, social)</Label><Input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} className="mt-2" /></div>
          <div><Label>Campaign * (e.g., summer_sale)</Label><Input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} className="mt-2" /></div>
          <div><Label>Term (optional - keywords)</Label><Input value={utmTerm} onChange={e => setUtmTerm(e.target.value)} className="mt-2" /></div>
          <div className="md:col-span-2"><Label>Content (optional - ad variation)</Label><Input value={utmContent} onChange={e => setUtmContent(e.target.value)} className="mt-2" /></div>
        </div>
        <div className="bg-slate-100 rounded-xl p-4">
          <Label className="text-xs text-slate-500">Generated URL</Label>
          <div className="flex gap-2 mt-2">
            <Input value={fullUrl} readOnly className="bg-white font-mono text-sm" />
            <Button onClick={() => copyToClipboard(fullUrl)} variant="outline">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <ResetButton onReset={() => { setBaseUrl('https://example.com'); setUtmSource('google'); setUtmMedium('cpc'); setUtmCampaign('summer_sale'); setUtmTerm(''); setUtmContent(''); }} />
        </div>
      </div>
    );
  }

  if (activeTool === 'ad-sizes') {
    const adSizes = [
      // Meta (Facebook/Instagram)
      { platform: 'Meta', placement: 'Feed Image', width: 1200, height: 628, ratio: '1.91:1', type: 'Image' },
      { platform: 'Meta', placement: 'Feed Square', width: 1080, height: 1080, ratio: '1:1', type: 'Image' },
      { platform: 'Meta', placement: 'Stories', width: 1080, height: 1920, ratio: '9:16', type: 'Image/Video' },
      { platform: 'Meta', placement: 'Reels', width: 1080, height: 1920, ratio: '9:16', type: 'Video' },
      { platform: 'Meta', placement: 'Carousel', width: 1080, height: 1080, ratio: '1:1', type: 'Image' },
      // Google Display
      { platform: 'Google', placement: 'Leaderboard', width: 728, height: 90, ratio: '8.09:1', type: 'Image' },
      { platform: 'Google', placement: 'Medium Rectangle', width: 300, height: 250, ratio: '6:5', type: 'Image' },
      { platform: 'Google', placement: 'Large Rectangle', width: 336, height: 280, ratio: '6:5', type: 'Image' },
      { platform: 'Google', placement: 'Skyscraper', width: 160, height: 600, ratio: '4:15', type: 'Image' },
      { platform: 'Google', placement: 'Wide Skyscraper', width: 300, height: 600, ratio: '1:2', type: 'Image' },
      { platform: 'Google', placement: 'Billboard', width: 970, height: 250, ratio: '3.88:1', type: 'Image' },
      // YouTube
      { platform: 'YouTube', placement: 'Video (Standard)', width: 1920, height: 1080, ratio: '16:9', type: 'Video' },
      { platform: 'YouTube', placement: 'Shorts', width: 1080, height: 1920, ratio: '9:16', type: 'Video' },
      { platform: 'YouTube', placement: 'Thumbnail', width: 1280, height: 720, ratio: '16:9', type: 'Image' },
      { platform: 'YouTube', placement: 'Banner', width: 2560, height: 1440, ratio: '16:9', type: 'Image' },
      // TikTok
      { platform: 'TikTok', placement: 'In-Feed Video', width: 1080, height: 1920, ratio: '9:16', type: 'Video' },
      { platform: 'TikTok', placement: 'TopView', width: 1080, height: 1920, ratio: '9:16', type: 'Video' },
      { platform: 'TikTok', placement: 'Brand Takeover', width: 1080, height: 1920, ratio: '9:16', type: 'Image/Video' },
      // Snapchat
      { platform: 'Snapchat', placement: 'Single Image/Video', width: 1080, height: 1920, ratio: '9:16', type: 'Image/Video' },
      { platform: 'Snapchat', placement: 'Story Ad', width: 1080, height: 1920, ratio: '9:16', type: 'Video' },
      { platform: 'Snapchat', placement: 'Collection Ad', width: 1080, height: 1920, ratio: '9:16', type: 'Image' },
    ];

    const filteredSizes = adSizes.filter(ad => {
      const matchPlatform = adPlatform === 'all' || ad.platform.toLowerCase() === adPlatform;
      const matchSearch = searchAdSize === '' ||
        ad.placement.toLowerCase().includes(searchAdSize.toLowerCase()) ||
        ad.platform.toLowerCase().includes(searchAdSize.toLowerCase());
      return matchPlatform && matchSearch;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Ad Size Guide (Images & Video)</h3>
          <ShareButtons toolId="ad-sizes" toolName="Ad Size Guide" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Filter by Platform</Label>
            <Select value={adPlatform} onValueChange={setAdPlatform}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="meta">Meta (Facebook/Instagram)</SelectItem>
                <SelectItem value="google">Google Display</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="snapchat">Snapchat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Search</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={searchAdSize} onChange={(e) => setSearchAdSize(e.target.value)} className="pl-10" placeholder="Search placements..." />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-3 rounded-l-lg">Platform</th>
                <th className="text-left p-3">Placement</th>
                <th className="text-center p-3">Width</th>
                <th className="text-center p-3">Height</th>
                <th className="text-center p-3">Aspect Ratio</th>
                <th className="text-center p-3 rounded-r-lg">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredSizes.map((ad, i) => (
                <tr key={i} className="border-b hover:bg-slate-50">
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ad.platform === 'Meta' ? 'bg-blue-100 text-blue-700' :
                      ad.platform === 'Google' ? 'bg-green-100 text-green-700' :
                      ad.platform === 'YouTube' ? 'bg-red-100 text-red-700' :
                      ad.platform === 'TikTok' ? 'bg-pink-100 text-pink-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{ad.platform}</span>
                  </td>
                  <td className="p-3 font-medium">{ad.placement}</td>
                  <td className="p-3 text-center">{ad.width}px</td>
                  <td className="p-3 text-center">{ad.height}px</td>
                  <td className="p-3 text-center">{ad.ratio}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      ad.type === 'Video' ? 'bg-purple-100 text-purple-700' :
                      ad.type === 'Image' ? 'bg-slate-100 text-slate-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{ad.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">{filteredSizes.length} ad sizes found</p>
      </div>
    );
  }

  return null;
}
