import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { 
  CurrencyRupeeIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';

const COLORS = ['#10B981', '#3B82F6', '#FBBF24', '#EF4444', '#8B5CF6', '#EC4899'];

// Add missing constants and helper functions
const transformDataForPie = (data) => {
  if (!data || data.length === 0) return [];
  const latestData = data[data.length - 1];
  return Object.entries(latestData)
    .filter(([key]) => key !== 'name')
    .map(([key, value]) => ({
      name: key,
      value: value
    }));
};

const renderColorfulLegendText = (value) => {
  return <span className="text-sm text-gray-700">{value}</span>;
};

const Charts = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('month');
  const [category, setCategory] = useState('income');

  const rawData = {
    income: [
      { name: t('charts.common.week1'), crops: 15000, dairy: 8000, poultry: 5000 },
      { name: t('charts.common.week2'), crops: 12000, dairy: 9000, poultry: 6000 },
      { name: t('charts.common.week3'), crops: 18000, dairy: 7500, poultry: 4500 },
      { name: t('charts.common.week4'), crops: 22000, dairy: 8500, poultry: 5500 },
    ],
    expenses: [
      { name: t('charts.common.week1'), seeds: 5000, feed: 4000, fertilizer: 3000, labor: 2000 },
      { name: t('charts.common.week2'), seeds: 2000, feed: 4200, fertilizer: 3500, labor: 2000 },
      { name: t('charts.common.week3'), seeds: 1000, feed: 3800, fertilizer: 2800, labor: 2000 },
      { name: t('charts.common.week4'), seeds: 3000, feed: 4100, fertilizer: 3200, labor: 2000 },
    ],
    livestock: [
      { name: t('charts.common.week1'), cows: 10, chickens: 50, goats: 15 },
      { name: t('charts.common.week2'), cows: 12, chickens: 55, goats: 15 },
      { name: t('charts.common.week3'), cows: 12, chickens: 60, goats: 18 },
      { name: t('charts.common.week4'), cows: 15, chickens: 65, goats: 20 },
    ],
    crops: [
      { name: t('charts.common.week1'), rice: 1000, wheat: 800, vegetables: 500 },
      { name: t('charts.common.week2'), rice: 1200, wheat: 900, vegetables: 600 },
      { name: t('charts.common.week3'), rice: 1100, wheat: 850, vegetables: 700 },
      { name: t('charts.common.week4'), rice: 1300, wheat: 950, vegetables: 800 },
    ],
  };

  // Transform data based on filters
  const chartData = useMemo(() => {
    const data = rawData[category] || [];
    return dateRange === 'week' ? data.slice(-1) : data;
  }, [category, dateRange, rawData]);

  // Calculate trends and insights
  const getTrend = (data) => {
    const lastTwo = data.slice(-2);
    if (lastTwo.length < 2) return 0;
    
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const values = Object.values(lastTwo[1]).filter(v => typeof v === 'number');
    const prevValues = Object.values(lastTwo[0]).filter(v => typeof v === 'number');
    
    return (sum(values) - sum(prevValues)) / sum(prevValues) * 100;
  };

  const trend = getTrend(chartData);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-emerald-800">{t('charts.title')}</h1>
        </div>

        {/* Simple explanation box */}
        <div className="bg-emerald-50 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <QuestionMarkCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-emerald-800 font-medium mb-2">{t('charts.helper.whatIsThis')}</p>
              <p className="text-emerald-700 text-sm">{t('charts.helper.explanation')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <CurrencyRupeeIcon className="w-5 h-5 text-emerald-600" />
            <select
              className="border-none focus:ring-0 text-lg font-medium text-gray-700"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {Object.keys(rawData).map(cat => (
                <option key={cat} value={cat}>
                  {t(`charts.categories.simple.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
            <select
              className="border-none focus:ring-0 text-lg font-medium text-gray-700"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">{t('charts.dateRanges.simple.week')}</option>
              <option value="month">{t('charts.dateRanges.simple.month')}</option>
              <option value="year">{t('charts.dateRanges.simple.year')}</option>
            </select>
          </div>
        </div>

        {/* Trend indicator with explanation */}
        {trend !== 0 && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 ${
            trend > 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {trend > 0 ? (
              <ArrowUpIcon className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDownIcon className="w-5 h-5 text-red-600" />
            )}
            <span className={`text-lg ${trend > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {trend > 0 ? t('charts.trend.increase') : t('charts.trend.decrease')}
              {' '}({Math.abs(trend).toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('charts.chartTypes.bar')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={renderColorfulLegendText} />
              {Object.keys(chartData[0] || {})
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    name={t(`charts.categories.${key}`)}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('charts.chartTypes.line')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={renderColorfulLegendText} />
              {Object.keys(chartData[0] || {})
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index % COLORS.length]}
                    name={t(`charts.categories.${key}`)}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">{t('charts.chartTypes.pie')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={transformDataForPie(chartData)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                dataKey="value"
              >
                {transformDataForPie(chartData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={renderColorfulLegendText} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Help section */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">{t('charts.help.title')}</h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="w-4 h-4 mt-1 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-blue-800">{t('charts.help.barChart')}</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-4 h-4 mt-1 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-blue-800">{t('charts.help.lineChart')}</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-4 h-4 mt-1 rounded-full bg-yellow-500 flex-shrink-0" />
            <span className="text-blue-800">{t('charts.help.pieChart')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// Helper components and functions
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white p-3 border rounded-lg shadow-lg">
      <p className="font-semibold">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span>{item.name}: ₹{item.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default Charts;
