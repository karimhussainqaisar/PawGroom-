import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatISO } from '../../data/initialData';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  Download, 
  PieChart as PieIcon, 
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { PremiumReportModal } from '../modals/PremiumReportModal';
import { generatePremiumRevenueCSV, downloadCSV, RevenueDailyItem, RevenueServiceItem, RevenueStaffItem } from '../../utils/reportExport';

export const RevenueView: React.FC = () => {
  const { appointments, expenses, services, staff, clients, settings, formatPrice, currencySymbol, showToast } = useApp();
  const [chartMode, setChartMode] = useState<'line' | 'area'>('line');
  const [lineBreakdown, setLineBreakdown] = useState<'total' | 'breakdown'>('breakdown');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed'>('all');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const today = new Date();
  const currentMonthLabel = today.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = today.getFullYear();
  const todayStr = formatISO(today);
  const currentMonthStr = todayStr.slice(0, 7);

  // Active revenue-generating appointments
  const activeAppts = React.useMemo(() => {
    return appointments.filter((a) => {
      if (a.status === 'cancelled') return false;
      if (filterStatus === 'completed' && a.status !== 'completed') return false;
      return true;
    });
  }, [appointments, filterStatus]);

  // Today's Revenue
  const todayRevenue = React.useMemo(() => {
    return appointments
      .filter((a) => a.date === todayStr && a.status !== 'cancelled')
      .reduce((sum, a) => sum + a.price + (a.retail || 0), 0);
  }, [appointments, todayStr]);

  // Financial Metrics (Current Month)
  const augAppts = React.useMemo(() => {
    return activeAppts.filter((a) => a.date.startsWith(currentMonthStr));
  }, [activeAppts, currentMonthStr]);

  const totalGroomRev = augAppts.reduce((sum, a) => sum + a.price, 0);
  const totalRetailRev = augAppts.reduce((sum, a) => sum + (a.retail || 0), 0);
  const grossRev = totalGroomRev + totalRetailRev;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossRev - totalExpenses;
  const avgTicket = augAppts.length > 0 ? grossRev / augAppts.length : 0;

  // Daily revenue chart data for all days of the current month
  const chartData = React.useMemo(() => {
    const map: Record<string, { date: string; fullDate: string; grooming: number; retail: number; total: number }> = {};
    const [yearStr, monthStr] = currentMonthStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Fill days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const iso = `${yearStr}-${monthStr}-${dayStr}`;
      const label = `Day ${day}`;
      map[iso] = { date: label, fullDate: iso, grooming: 0, retail: 0, total: 0 };
    }

    augAppts.forEach((a) => {
      if (map[a.date]) {
        map[a.date].grooming += a.price;
        map[a.date].retail += a.retail || 0;
        map[a.date].total += a.price + (a.retail || 0);
      }
    });

    return Object.values(map).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [augAppts, currentMonthStr]);

  // Peak Earning Day
  const peakDay = React.useMemo(() => {
    if (chartData.length === 0) return { date: 'N/A', amount: 0 };
    return chartData.reduce((max, d) => (d.total > max.amount ? { date: d.date, amount: d.total } : max), { date: chartData[0].date, amount: chartData[0].total });
  }, [chartData]);

  // Top Grossing Services
  const topServicesData = React.useMemo(() => {
    const map: Record<string, number> = {};
    augAppts.forEach((a) => {
      const svc = services.find((s) => s.id === a.serviceId);
      const name = svc ? svc.name : 'Other';
      map[name] = (map[name] || 0) + a.price;
    });

    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [augAppts, services]);

  const handleExportCSV = () => {
    const dailyItems: RevenueDailyItem[] = chartData.map((d) => ({
      date: d.fullDate,
      dayName: d.date,
      count: augAppts.filter(a => a.date === d.fullDate).length,
      groomingRev: d.grooming,
      retailRev: d.retail,
      totalRev: d.total,
      avgTicket: augAppts.filter(a => a.date === d.fullDate).length > 0 
        ? d.total / augAppts.filter(a => a.date === d.fullDate).length 
        : 0,
    }));

    const serviceItems: RevenueServiceItem[] = topServicesData.map((s) => ({
      name: s.name,
      category: 'Grooming',
      count: augAppts.filter(a => services.find(srv => srv.id === a.serviceId)?.name === s.name).length,
      totalRev: s.total,
      percentage: grossRev > 0 ? (s.total / grossRev) * 100 : 0,
    }));

    const staffItems: RevenueStaffItem[] = staff.map((st) => {
      const stAppts = augAppts.filter(a => a.staffId === st.id);
      const sRev = stAppts.reduce((sum, a) => sum + a.price, 0);
      const cRate = st.commission || 50;
      const cPayout = (sRev * cRate) / 100;
      return {
        name: st.name,
        role: st.role,
        count: stAppts.length,
        serviceRev: sRev,
        commissionRate: cRate,
        commissionPayout: cPayout,
        studioNet: sRev - cPayout,
      };
    });

    const transactions = augAppts.map((a) => {
      const cl = clients.find(c => c.id === a.clientId);
      const srv = services.find(s => s.id === a.serviceId);
      const st = staff.find(s => s.id === a.staffId);
      return {
        id: a.id,
        date: a.date,
        time: a.start,
        client: cl?.owner || 'Client',
        pet: cl?.name || 'Pet',
        service: srv?.name || 'Service',
        staff: st?.name || 'Staff',
        groomPrice: a.price,
        retailPrice: a.retail || 0,
        total: a.price + (a.retail || 0),
        status: a.status,
      };
    });

    const csvContent = generatePremiumRevenueCSV(
      {
        periodLabel: `${currentMonthLabel} ${currentYear}`,
        grossRev,
        groomRev: totalGroomRev,
        retailRev: totalRetailRev,
        expenses: totalExpenses,
        netProfit,
        profitMargin: grossRev > 0 ? (netProfit / grossRev) * 100 : 0,
        totalAppts: augAppts.length,
        avgTicket,
        peakDayLabel: peakDay.date,
        peakDayAmount: peakDay.amount,
      },
      dailyItems,
      serviceItems,
      staffItems,
      transactions,
      settings
    );

    downloadCSV(csvContent, `PawBook_Revenue_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    showToast('Exported executive financial CSV report!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export */}
      <div className="card-box p-3.5 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-display font-bold text-base sm:text-lg text-theme-primary">
            Financial & Revenue Analytics
          </h2>
          <p className="text-xs text-[#5C716C] mt-0.5">
            Gross sales, retail product add-ons, net profit margin & daily earnings trends for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F1EEE6] p-1 rounded-full border border-[#D8D3C4]">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-theme-primary text-white shadow-xs' : 'text-[#5C716C] hover:text-theme-primary'
              }`}
            >
              All Active
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                filterStatus === 'completed' ? 'bg-theme-primary text-white shadow-xs' : 'text-[#5C716C] hover:text-theme-primary'
              }`}
            >
              Completed
            </button>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-3.5 py-2 rounded-full border border-theme-primary/40 bg-white hover:bg-[#FAF8F5] text-theme-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
            title="Open Executive Reports & Visual Analytics"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Executive Reports</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-primary text-xs px-3.5 sm:px-4 py-2 rounded-full flex items-center justify-center gap-1.5 font-bold shadow-md cursor-pointer shrink-0 grow sm:grow-0"
            title="Download formatted CSV report"
          >
            <Download className="w-4 h-4" /> <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Key Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue */}
        <div className="card-box p-4 bg-gradient-to-br from-[#FFE4D3] via-[#FFD7BE] to-[#FFC5A1] text-[#541900] border-none shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              Today's Revenue ({today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </span>
            <Calendar className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-3xl font-display font-black tracking-tight mt-1">
            {formatPrice(todayRevenue)}
          </div>
          <div className="text-xs font-bold opacity-80 mt-1">
            From today's scheduled grooms
          </div>
        </div>

        {/* Card 2: Gross Monthly Sales */}
        <div className="card-box p-4">
          <div className="text-xs font-bold text-[#5C716C] uppercase">
            Gross {currentMonthLabel} Sales
          </div>
          <div className="text-3xl font-display font-bold text-[#173E39] mt-1">
            {formatPrice(grossRev)}
          </div>
          <div className="text-xs text-[#2E8A81] font-bold mt-1">
            {formatPrice(totalGroomRev)} grooms + {formatPrice(totalRetailRev)} retail
          </div>
        </div>

        {/* Card 3: Average Ticket */}
        <div className="card-box p-4">
          <div className="text-xs font-bold text-[#5C716C] uppercase">Average Ticket</div>
          <div className="text-3xl font-display font-bold text-[#173E39] mt-1">
            {formatPrice(avgTicket)}
          </div>
          <div className="text-xs text-[#5C716C] mt-1">
            Per grooming session
          </div>
        </div>

        {/* Card 4: Net Profit Rate */}
        <div className="card-box p-4">
          <div className="text-xs font-bold text-[#5C716C] uppercase">Net Operating Margin</div>
          <div className="text-3xl font-display font-bold text-[#3E9B6E] mt-1">
            {formatPrice(netProfit)}
          </div>
          <div className="text-xs text-[#3E9B6E] font-bold mt-1">
            {grossRev > 0 ? Math.round((netProfit / grossRev) * 100) : 0}% net profit margin
          </div>
        </div>
      </div>

      {/* Daily Earnings Chart (Recharts) */}
      <div className="card-box space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D3C4]/60 pb-3">
          <div>
            <h3 className="font-display font-bold text-base text-[#173E39] flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-[#2E8A81]" />
              Daily {currentMonthLabel} {currentYear} Earnings Chart
            </h3>
            <p className="text-xs text-[#5C716C] mt-0.5">
              Visualize revenue growth across all days of {currentMonthLabel} {currentYear}.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap bg-[#F1EEE6]/80 p-1.5 rounded-2xl border border-[#D8D3C4] shadow-2xs">
            {/* Breakdown Toggle Group */}
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-[#D8D3C4]/60">
              <button
                type="button"
                onClick={() => setLineBreakdown('breakdown')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  lineBreakdown === 'breakdown'
                    ? 'bg-[#173E39] text-white shadow-xs scale-[1.02]'
                    : 'text-[#5C716C] hover:text-[#173E39] hover:bg-[#F1EEE6]'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5 text-[#E8734A]" />
                <span>Grooming vs Retail</span>
              </button>
              <button
                type="button"
                onClick={() => setLineBreakdown('total')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  lineBreakdown === 'total'
                    ? 'bg-[#173E39] text-white shadow-xs scale-[1.02]'
                    : 'text-[#5C716C] hover:text-[#173E39] hover:bg-[#F1EEE6]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#2E8A81]" />
                <span>Total Sales</span>
              </button>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-[#D8D3C4]" />

            {/* Chart Type Toggle Group */}
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-[#D8D3C4]/60">
              <button
                type="button"
                onClick={() => setChartMode('line')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartMode === 'line'
                    ? 'bg-[#2E8A81] text-white shadow-xs scale-[1.02]'
                    : 'text-[#5C716C] hover:text-[#173E39] hover:bg-[#F1EEE6]'
                }`}
                title="Line Chart View"
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>Line</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('area')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartMode === 'area'
                    ? 'bg-[#2E8A81] text-white shadow-xs scale-[1.02]'
                    : 'text-[#5C716C] hover:text-[#173E39] hover:bg-[#F1EEE6]'
                }`}
                title="Area Fill View"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Area</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Chart Canvas Container */}
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" vertical={false} />
                <XAxis dataKey="date" stroke="#5C716C" fontSize={10} tickLine={false} interval={2} />
                <YAxis stroke="#5C716C" fontSize={11} tickLine={false} tickFormatter={(v) => formatPrice(v)} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#173E39',
                    borderColor: '#2E8A81',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  formatter={(val: any, name: any) => [formatPrice(val), name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                {lineBreakdown === 'breakdown' ? (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="grooming" 
                      name="Grooming Services" 
                      stroke="#2E8A81" 
                      strokeWidth={3} 
                      dot={{ r: 3, fill: '#2E8A81' }} 
                      activeDot={{ r: 6, fill: '#2E8A81', stroke: '#fff', strokeWidth: 2 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="retail" 
                      name="Retail Products" 
                      stroke="#E8734A" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      dot={{ r: 2, fill: '#E8734A' }} 
                    />
                  </>
                ) : (
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Revenue" 
                    stroke="#173E39" 
                    strokeWidth={3.5} 
                    dot={{ r: 4, fill: '#173E39' }} 
                    activeDot={{ r: 7, fill: '#E8734A' }} 
                  />
                )}
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrooming" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E8A81" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2E8A81" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRetail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8734A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#E8734A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" vertical={false} />
                <XAxis dataKey="date" stroke="#5C716C" fontSize={10} interval={2} />
                <YAxis stroke="#5C716C" fontSize={11} tickFormatter={(v) => formatPrice(v)} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#173E39', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => formatPrice(val)}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="grooming" name="Grooming Revenue" stroke="#2E8A81" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGrooming)" />
                <Area type="monotone" dataKey="retail" name="Retail Revenue" stroke="#E8734A" strokeWidth={2} fillOpacity={1} fill="url(#colorRetail)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Grossing Services Bar Chart */}
      <div className="card-box space-y-4">
        <h3 className="font-display font-bold text-base text-[#173E39]">
          Top Grossing Grooming Services ({currentMonthLabel} {currentYear})
        </h3>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topServicesData} layout="vertical">
              <XAxis type="number" stroke="#5C716C" fontSize={11} tickFormatter={(v) => formatPrice(v)} />
              <YAxis dataKey="name" type="category" stroke="#5C716C" fontSize={11} width={150} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#173E39', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => formatPrice(val)}
              />
              <Bar dataKey="total" fill="#E8734A" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Executive Report & Visual Graphs Modal */}
      {reportModalOpen && (
        <PremiumReportModal 
          initialTab="revenue" 
          onClose={() => setReportModalOpen(false)} 
        />
      )}
    </div>
  );
};
