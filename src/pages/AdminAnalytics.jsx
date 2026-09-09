import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Loader2, Users, Eye, MousePointer } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminAnalytics() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['analytics-events'],
    queryFn: () => dataLayer.analytics.getAll()
  });

  const totalViews = events.filter(event => event.event_type === 'page_view').length;
  const uniqueVisitors = new Set(events.map(event => event.session_id)).size;
  const totalClicks = events.filter(event => event.event_type === 'click').length;

  const viewsByPage = events
    .filter(event => event.event_type === 'page_view')
    .reduce((pages, event) => {
      const page = event.page_path || 'unknown';
      pages[page] = (pages[page] || 0) + 1;
      return pages;
    }, {});

  const chartData = Object.entries(viewsByPage)
    .map(([name, views]) => ({ name, views }))
    .sort((a, b) => b.views - a.views);
  const highestViewCount = Math.max(1, ...chartData.map(item => item.views));

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading analytics</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard title="Total Page Views" value={totalViews} icon={Eye} />
              <MetricCard title="Unique Visitors" value={uniqueVisitors} icon={Users} />
              <MetricCard title="Total Interactions" value={totalClicks} icon={MousePointer} />
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Page Views Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="py-12 text-center text-slate-500">No page-view data is available yet.</p>
                ) : (
                  <div className="space-y-4" role="img" aria-label="Page views by page">
                    {chartData.map(item => (
                      <div key={item.name}>
                        <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                          <span className="truncate font-medium text-slate-700" title={item.name}>{item.name}</span>
                          <span className="shrink-0 tabular-nums text-slate-500">{item.views}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                            style={{ width: `${Math.max(2, (item.views / highestViewCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// Runtime PropTypes are not used in this JavaScript project.

function MetricCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
