import { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

function Reports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('bookings');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'bookings', label: 'Bookings Report', description: 'Complete booking history and statistics' },
    { value: 'revenue', label: 'Revenue Report', description: 'Financial summary and revenue analysis' },
    { value: 'users', label: 'Users Report', description: 'User registration and activity data' },
    { value: 'services', label: 'Services Report', description: 'Service performance and popularity' },
    { value: 'reviews', label: 'Reviews Report', description: 'Customer reviews and ratings analysis' },
    { value: 'transactions', label: 'Transactions Report', description: 'Payment and wallet transactions' },
  ];

  const handleGenerateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select date range',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      // API call would go here
      // const response = await api.post('/admin/reports/generate', {
      //   type: reportType,
      //   startDate: dateRange.startDate,
      //   endDate: dateRange.endDate
      // });

      setTimeout(() => {
        toast({
          title: 'Success',
          description: `${reportTypes.find((r) => r.value === reportType).label} generated successfully!`,
        });
        setGenerating(false);
      }, 2000);
    } catch (error) {
      // console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
      setGenerating(false);
    }
  };

  const handleExport = (format) => {
    toast({
      title: 'Exporting',
      description: `Exporting report as ${format.toUpperCase()}...`,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">Generate detailed reports for business insights</p>
      </div>

      {/* Report Selection */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <div
              key={report.value}
              onClick={() => setReportType(report.value)}
              className={`p-4 border rounded-lg cursor-pointer transition ${reportType === report.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-semibold mb-1">{report.label}</h4>
              <p className="text-sm text-gray-600">{report.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Date Range Selection */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </Card>

      {/* Quick Date Ranges */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Select</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => {
              const today = new Date();
              const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              setDateRange({
                startDate: lastWeek.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0],
              });
            }}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Last 7 Days
          </Button>
          <Button
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              setDateRange({
                startDate: lastMonth.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0],
              });
            }}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Last 30 Days
          </Button>
          <Button
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              setDateRange({
                startDate: firstDay.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0],
              });
            }}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            This Month
          </Button>
          <Button
            onClick={() => {
              const today = new Date();
              const lastYear = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
              setDateRange({
                startDate: lastYear.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0],
              });
            }}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Last Year
          </Button>
        </div>
      </Card>

      {/* Generate Report */}
      <div className="flex gap-4">
        <Button
          onClick={handleGenerateReport}
          disabled={generating}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {generating ? 'Generating Report...' : 'Generate Report'}
        </Button>
        <Button
          onClick={() => handleExport('csv')}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          Export as CSV
        </Button>
        <Button
          onClick={() => handleExport('pdf')}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Export as PDF
        </Button>
        <Button
          onClick={() => handleExport('excel')}
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          Export as Excel
        </Button>
      </div>
    </div>
  );
}

export default Reports;
