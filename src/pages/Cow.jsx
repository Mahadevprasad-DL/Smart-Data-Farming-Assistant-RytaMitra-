import React, { useState, useEffect } from 'react'
import { GiCow, GiMilkCarton, GiMoneyStack, GiChart } from 'react-icons/gi'
import { FaTrash } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import supabase from '../supabaseClient'

const Cow = () => {
  const { t } = useTranslation();
  const [milkData, setMilkData] = useState({
    totalCows: 0,
    dailyProduction: 0,
    monthlyRevenue: 0,
    averagePerCow: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCowData, setNewCowData] = useState({
    count: 1,
    dailyProduction: 0,
    milkPrice: 60
  });
  const [cowsList, setCowsList] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  useEffect(() => {
    fetchCowData();
    fetchCowsList();
  }, []);

  const fetchCowData = async () => {
    try {
      const { data, error } = await supabase
        .from('farmer_cows')
        .select('*')
        .eq('farmer_id', 1)
        .order('updated_timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cow data:', error);
        return;
      }

      if (data) {
        setMilkData({
          totalCows: data.number_of_cows || 0,
          dailyProduction: data.daily_milk_production || 0,
          monthlyRevenue: data.monthly_revenue || 0,
          averagePerCow: data.average_per_cow || 0
        });
      }
    } catch (err) {
      console.error('Error fetching cow data:', err);
    }
  };

  const fetchCowsList = async () => {
    try {
      const { data, error } = await supabase
        .from('cow_daily_production')
        .select('*')
        .eq('farmer_id', 1)
        .order('record_date', { ascending: false });

      if (error) {
        console.error('Error fetching cows list:', error);
        return;
      }

      if (!data || data.length === 0) {
        setCowsList([]);
        return;
      }

      // Map each record to table row
      const cowsData = data.map((item, index) => ({
        id: item.id,
        entryNumber: index + 1,
        recordDate: item.record_date,
        numberOfCows: item.number_of_cows,
        dailyProduction: item.milk_produced_liters,
        milkPrice: item.milk_price_per_liter || 60,
        totalPrice: item.milk_produced_liters * (item.milk_price_per_liter || 60),
        monthlyRevenue: item.milk_produced_liters * (item.milk_price_per_liter || 60) * 30
      }));

      setCowsList(cowsData);
    } catch (err) {
      console.error('Error fetching cows list:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newCowData.count || !newCowData.dailyProduction) {
      alert('Please fill all fields');
      return;
    }

    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('farmer_cows')
        .select('id')
        .eq('farmer_id', 1)
        .limit(1)
        .single();

      let result;

      if (existingData) {
        // Update existing record
        result = await supabase
          .from('farmer_cows')
          .update({
            number_of_cows: parseInt(newCowData.count),
            daily_milk_production: parseFloat(newCowData.dailyProduction),
            milk_price_per_liter: parseFloat(newCowData.milkPrice),
            updated_timestamp: new Date().toISOString()
          })
          .eq('farmer_id', 1)
          .select();
      } else {
        // Insert new record
        result = await supabase
          .from('farmer_cows')
          .insert([{
            farmer_id: 1,
            number_of_cows: parseInt(newCowData.count),
            daily_milk_production: parseFloat(newCowData.dailyProduction),
            milk_price_per_liter: parseFloat(newCowData.milkPrice)
          }])
          .select();
      }

      if (result.error) {
        console.error('Error saving cow data:', result.error);
        showNotification('Error saving data: ' + result.error.message, 'error');
        return;
      }

      // Also insert into daily production table
      const { error: dailyError } = await supabase
        .from('cow_daily_production')
        .insert([{
          farmer_id: 1,
          record_date: new Date().toISOString().split('T')[0],
          number_of_cows: parseInt(newCowData.count),
          milk_produced_liters: parseFloat(newCowData.dailyProduction),
          milk_price_per_liter: parseFloat(newCowData.milkPrice)
        }])
        .select();

      if (dailyError) {
        console.error('Error saving daily record:', dailyError);
        showNotification('Error saving daily record: ' + dailyError.message, 'error');
        return;
      }

      await fetchCowData();
      await fetchCowsList();
      setShowAddForm(false);
      setNewCowData({ count: 1, dailyProduction: 0, milkPrice: 60 });
      showNotification('Cow data saved successfully!');
    } catch (err) {
      console.error('Error adding cow data:', err);
      showNotification('Error: ' + err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete all cow data?')) {
      try {
        const { error: cowError } = await supabase
          .from('farmer_cows')
          .delete()
          .eq('farmer_id', 1);

        if (cowError) {
          console.error('Error deleting cow data:', cowError);
          return;
        }

        setMilkData({
          totalCows: 0,
          dailyProduction: 0,
          monthlyRevenue: 0,
          averagePerCow: 0
        });
        showNotification('Cow data deleted successfully!');
      } catch (err) {
        console.error('Error deleting cow data:', err);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 text-center shadow-2xl backdrop-blur-sm bg-white ${
              notification.type === 'error' ? 'border-red-100' : 'border-emerald-100'
            }`}
          >
            <div
              className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${
                notification.type === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
            >
              {notification.type === 'error' ? '!' : '✓'}
            </div>
            <p className="text-gray-800 text-base font-semibold">{notification.message}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Dairy Management</h1>
        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Cow
          </button>
          {milkData.totalCows > 0 && (
            <button
              onClick={handleDelete}
              className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <FaTrash /> Delete
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Cow Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Cows</label>
              <input
                type="number"
                min="1"
                value={newCowData.count}
                onChange={(e) => setNewCowData({...newCowData, count: e.target.value})}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Daily Milk Production (L)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newCowData.dailyProduction}
                onChange={(e) => setNewCowData({...newCowData, dailyProduction: e.target.value})}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Milk Price per Liter (₹)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newCowData.milkPrice}
                onChange={(e) => setNewCowData({...newCowData, milkPrice: e.target.value})}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Save
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <GiCow className="text-4xl text-blue-600" />
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total Cows</h3>
              <p className="text-2xl font-bold text-gray-800">{milkData.totalCows}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <GiMilkCarton className="text-4xl text-blue-600" />
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Daily Production (L)</h3>
              <p className="text-2xl font-bold text-gray-800">{milkData.dailyProduction}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <GiMoneyStack className="text-4xl text-blue-600" />
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Monthly Revenue (₹)</h3>
              <p className="text-2xl font-bold text-gray-800">{Math.round(milkData.monthlyRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <GiChart className="text-4xl text-blue-600" />
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Average per Cow (L)</h3>
              <p className="text-2xl font-bold text-gray-800">{milkData.averagePerCow.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Cows Production Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100 border-b-2 border-blue-600">
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Entry #</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Date</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Number of Cows</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Daily Production (L)</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Milk Price (₹/L)</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Daily Revenue (₹)</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Monthly Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              {cowsList.length > 0 ? (
                cowsList.map((cow, index) => (
                  <tr key={cow.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{cow.entryNumber}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{new Date(cow.recordDate).toLocaleDateString('en-IN')}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{cow.numberOfCows}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{cow.dailyProduction.toFixed(2)} L</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">₹{cow.milkPrice}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">₹{cow.totalPrice.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700 font-semibold">₹{cow.monthlyRevenue.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="border border-gray-300 px-4 py-3 text-center text-gray-500">
                    No cow data available. Add a new record to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {cowsList.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm">Total Entries</p>
              <p className="text-2xl font-bold text-blue-600">{cowsList.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
              <p className="text-gray-600 text-sm">Total Cows (Latest)</p>
              <p className="text-2xl font-bold text-green-600">{cowsList[0]?.numberOfCows || 0}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
              <p className="text-gray-600 text-sm">Average Daily Production</p>
              <p className="text-2xl font-bold text-yellow-600">{(cowsList.reduce((sum, cow) => sum + cow.dailyProduction, 0) / cowsList.length).toFixed(2)} L</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm">Total Revenue (All Entries)</p>
              <p className="text-2xl font-bold text-purple-600">₹{cowsList.reduce((sum, cow) => sum + cow.totalPrice, 0).toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cow
