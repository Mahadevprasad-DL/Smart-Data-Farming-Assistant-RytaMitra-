import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const AnimalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduction, setShowAddProduction] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    price: '',
    notes: ''
  });

  useEffect(() => {
    fetchAnimalDetails();
  }, [id]);

  const fetchAnimalDetails = async () => {
    try {
      setLoading(true);
      // Fetch animal
      const { data: animalData, error: animalError } = await supabase
        .from('animals')
        .select('*')
        .eq('id', id)
        .single();

      if (animalError) throw animalError;
      setAnimal(animalData);

      // Fetch productions
      const { data: productionData, error: productionError } = await supabase
        .from('animal_productions')
        .select('*')
        .eq('animal_id', id)
        .order('date', { ascending: false });

      if (productionError) throw productionError;
      setProductions(productionData || []);
    } catch (error) {
      console.error('Error fetching details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduction = async (e) => {
    e.preventDefault();
    
    if (!formData.quantity) {
      alert('Please enter quantity');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('animal_productions')
        .insert([{
          animal_id: id,
          date: formData.date,
          quantity: parseFloat(formData.quantity),
          price: formData.price ? parseFloat(formData.price) : null,
          notes: formData.notes,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      setProductions([data[0], ...productions]);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        price: '',
        notes: ''
      });
      setShowAddProduction(false);
    } catch (error) {
      console.error('Error adding production:', error.message);
      alert('Failed to add production record');
    }
  };

  const handleDeleteProduction = async (productionId) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from('animal_productions')
        .delete()
        .eq('id', productionId);

      if (error) throw error;
      setProductions(productions.filter(p => p.id !== productionId));
    } catch (error) {
      console.error('Error deleting production:', error.message);
      alert('Failed to delete record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Animal not found</p>
      </div>
    );
  }

  const totalQuantity = productions.reduce((sum, p) => sum + p.quantity, 0);
  const totalRevenue = productions.reduce((sum, p) => sum + (p.quantity * (p.price || 0)), 0);
  const avgDaily = productions.length > 0 ? (totalQuantity / productions.length).toFixed(2) : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/animals')}
              className="text-gray-600 hover:text-gray-800 text-lg"
            >
              ← Back
            </button>
            <div>
              <div className="text-5xl mb-2">{animal.icon}</div>
              <h1 className="text-3xl font-bold text-gray-800">{animal.name}</h1>
              <p className="text-gray-600">Type: {animal.animal_type}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddProduction(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Add Production
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Total Count</p>
            <p className="text-3xl font-bold text-gray-800">{animal.count}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Total Production</p>
            <p className="text-3xl font-bold text-blue-600">{totalQuantity.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Average Daily</p>
            <p className="text-3xl font-bold text-green-600">{avgDaily}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Total Revenue (₹)</p>
            <p className="text-3xl font-bold text-purple-600">₹{totalRevenue.toFixed(0)}</p>
          </div>
        </div>

        {/* Production Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Production Records</h2>
          </div>
          
          {productions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No production records yet. Click "Add Production" to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price (₹)</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Revenue (₹)</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {productions.map((production) => (
                    <tr key={production.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{production.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{production.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">₹{production.price || '-'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ₹{(production.quantity * (production.price || 0)).toFixed(0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{production.notes || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteProduction(production.id)}
                          className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Production Modal */}
        {showAddProduction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="bg-blue-600 text-white p-6">
                <h2 className="text-2xl font-bold">Add Production Record</h2>
              </div>

              <form onSubmit={handleAddProduction} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Enter quantity"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddProduction(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalDetails;
