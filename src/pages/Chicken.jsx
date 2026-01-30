import React, { useState, useEffect } from 'react'
import { GiChicken, GiMoneyStack } from 'react-icons/gi'
import { FaEgg, FaTrash } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import supabase from '../supabaseClient'

const Chicken = () => {
  const { t } = useTranslation();
  const [poultryData, setPoultryData] = useState({
    totalBirds: 0,
    dailyEggs: 0,
    monthlyRevenue: 0,
    averagePerBird: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBirdData, setNewBirdData] = useState({
    count: 1,
    dailyProduction: 0,
    eggPrice: 10
  });
  const [chickenList, setChickenList] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  useEffect(() => {
    fetchPoultryData();
    fetchChickenList();
  }, []);

  const fetchPoultryData = async () => {
    try {
      const { data, error } = await supabase
        .from('farmer_chickens')
        .select('*')
        .eq('farmer_id', 1)
        .order('updated_timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching poultry data:', error);
        return;
      }

      if (data) {
        setPoultryData({
          totalBirds: data.number_of_birds || 0,
          dailyEggs: data.daily_eggs || 0,
          monthlyRevenue: data.monthly_revenue || 0,
          averagePerBird: data.average_per_bird || 0
        });
      }
    } catch (err) {
      console.error('Error fetching poultry data:', err);
    }
  };

  const fetchChickenList = async () => {
    try {
      const { data, error } = await supabase
        .from('chicken_daily_production')
        .select('*')
        .eq('farmer_id', 1)
        .order('record_date', { ascending: false });

      if (error) {
        console.error('Error fetching chicken list:', error);
        return;
      }

      if (!data || data.length === 0) {
        setChickenList([]);
        return;
      }

      // Map each record to table row
      const chickenData = data.map((item, index) => ({
        id: item.id,
        entryNumber: index + 1,
        recordDate: item.record_date,
        numberOfBirds: item.number_of_birds,
        dailyProduction: item.eggs_produced,
        eggPrice: item.egg_price_per_unit || 10,
        totalPrice: item.eggs_produced * (item.egg_price_per_unit || 10),
        monthlyRevenue: item.eggs_produced * (item.egg_price_per_unit || 10) * 30
      }));

      setChickenList(chickenData);
    } catch (err) {
      console.error('Error fetching chicken list:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newBirdData.count || !newBirdData.dailyProduction || !newBirdData.eggPrice) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('farmer_chickens')
        .select('id')
        .eq('farmer_id', 1)
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing poultry record:', fetchError);
        showNotification('Error checking existing data', 'error');
        return;
      }

      const payload = {
        number_of_birds: parseInt(newBirdData.count),
        daily_eggs: parseFloat(newBirdData.dailyProduction),
        egg_price_per_unit: parseFloat(newBirdData.eggPrice),
        updated_timestamp: new Date().toISOString()
      };

      let result;

      if (existingData) {
        result = await supabase
          .from('farmer_chickens')
          .update(payload)
          .eq('farmer_id', 1)
          .select();
      } else {
        result = await supabase
          .from('farmer_chickens')
          .insert([{ farmer_id: 1, ...payload }])
          .select();
      }

      if (result.error) {
        console.error('Error saving poultry data:', result.error);
        showNotification('Error saving data: ' + result.error.message, 'error');
        return;
      }

      // Insert into daily production table
      const { error: dailyError } = await supabase
        .from('chicken_daily_production')
        .insert([{
          farmer_id: 1,
          record_date: new Date().toISOString().split('T')[0],
          number_of_birds: parseInt(newBirdData.count),
          eggs_produced: parseInt(newBirdData.dailyProduction),
          egg_price_per_unit: parseFloat(newBirdData.eggPrice)
        }])
        .select();

      if (dailyError) {
        console.error('Error saving daily eggs record:', dailyError);
        showNotification('Error saving daily record: ' + dailyError.message, 'error');
        return;
      }

      await fetchPoultryData();
      await fetchChickenList();
      setShowAddForm(false);
      setNewBirdData({ count: 1, dailyProduction: 0, eggPrice: 10 });
      showNotification('Poultry data saved successfully!');
    } catch (err) {
      console.error('Error adding poultry data:', err);
      showNotification('Error: ' + err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('animals.poultry.deleteConfirm'))) {
      try {
        const { error: mainError } = await supabase
          .from('farmer_chickens')
          .delete()
          .eq('farmer_id', 1);

        if (mainError) {
          console.error('Error deleting poultry data:', mainError);
          showNotification('Error deleting data', 'error');
          return;
        }

        await supabase
          .from('chicken_daily_production')
          .delete()
          .eq('farmer_id', 1);

        setPoultryData({
          totalBirds: 0,
          dailyEggs: 0,
          monthlyRevenue: 0,
          averagePerBird: 0
        });
        setChickenList([]);
        showNotification('Poultry data deleted successfully!');
      } catch (err) {
        console.error('Error deleting poultry data:', err);
        showNotification('Error: ' + err.message, 'error');
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
        <h1 className="text-3xl font-bold text-gray-800">{t('animals.poultry.title')}</h1>
        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 sm:flex-none bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            {t('animals.poultry.addNew')}
          </button>
          {poultryData.totalBirds > 0 && (
            <button
              onClick={handleDelete}
              className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <FaTrash /> {t('animals.poultry.delete')}
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('animals.poultry.addNewBird')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Birds</label>
              <input
                type="number"
                min="1"
                value={newBirdData.count}
                onChange={(e) => setNewBirdData({ ...newBirdData, count: e.target.value })}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Daily Egg Production</label>
              <input
                type="number"
                min="0"
                value={newBirdData.dailyProduction}
                onChange={(e) => setNewBirdData({ ...newBirdData, dailyProduction: e.target.value })}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Egg Price per Unit (₹)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newBirdData.eggPrice}
                onChange={(e) => setNewBirdData({ ...newBirdData, eggPrice: e.target.value })}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium"
            >
              {t('common.save')}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <GiChicken className="text-4xl text-orange-600" />
            <div>
              <h3 className="text-gray-600">{t('animals.poultry.totalBirds')}</h3>
              <p className="text-2xl font-bold text-gray-800">{poultryData.totalBirds}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <FaEgg className="text-4xl text-orange-600" />
            <div>
              <h3 className="text-gray-600">{t('animals.poultry.dailyEggs')}</h3>
              <p className="text-2xl font-bold text-gray-800">{poultryData.dailyEggs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <GiMoneyStack className="text-4xl text-orange-600" />
            <div>
              <h3 className="text-gray-600">{t('animals.poultry.monthlyRevenue')}</h3>
              <p className="text-2xl font-bold text-gray-800">{Math.round(poultryData.monthlyRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <FaEgg className="text-4xl text-orange-600" />
            <div>
              <h3 className="text-gray-600">{t('animals.poultry.averagePerBird')}</h3>
              <p className="text-2xl font-bold text-gray-800">{poultryData.averagePerBird.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Chicken Production Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-100 border-b-2 border-orange-600">
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Entry #</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Date</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Number of Birds</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Daily Egg Production</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Egg Price (₹/unit)</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Daily Revenue (₹)</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-800 font-semibold">Monthly Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              {chickenList.length > 0 ? (
                chickenList.map((chicken, index) => (
                  <tr key={chicken.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{chicken.entryNumber}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{new Date(chicken.recordDate).toLocaleDateString('en-IN')}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{chicken.numberOfBirds}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{chicken.dailyProduction}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">₹{chicken.eggPrice}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">₹{chicken.totalPrice.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700 font-semibold">₹{chicken.monthlyRevenue.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="border border-gray-300 px-4 py-3 text-center text-gray-500">
                    No chicken data available. Add a new record to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {chickenList.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
              <p className="text-gray-600 text-sm">Total Entries</p>
              <p className="text-2xl font-bold text-orange-600">{chickenList.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
              <p className="text-gray-600 text-sm">Total Birds (Latest)</p>
              <p className="text-2xl font-bold text-green-600">{chickenList[0]?.numberOfBirds || 0}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
              <p className="text-gray-600 text-sm">Average Daily Eggs</p>
              <p className="text-2xl font-bold text-yellow-600">{(chickenList.reduce((sum, chicken) => sum + chicken.dailyProduction, 0) / chickenList.length).toFixed(0)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm">Total Revenue (All Entries)</p>
              <p className="text-2xl font-bold text-purple-600">₹{chickenList.reduce((sum, chicken) => sum + chicken.totalPrice, 0).toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chicken
