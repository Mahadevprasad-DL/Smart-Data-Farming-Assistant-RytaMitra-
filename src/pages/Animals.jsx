import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GiCow, GiChicken } from 'react-icons/gi'
import { useTranslation } from 'react-i18next'
import supabase from '../supabaseClient'
import AddAnimalModal from '../components/AddAnimalModal'

const Animals = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [customAnimals, setCustomAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomAnimals();
  }, []);

  const fetchCustomAnimals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnimal = async (animalData) => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .insert([animalData])
        .select();

      if (error) throw error;
      
      setCustomAnimals([data[0], ...customAnimals]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding animal:', error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">{t('animals.title')}</h1>
        
        {/* Default Animals */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">Default Animals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              onClick={() => navigate('/cow')}
              className="bg-white p-8 rounded-xl shadow-md cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <GiCow className="text-5xl text-blue-600" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{t('animals.dairy.title')}</h2>
                  <p className="text-gray-600">{t('animals.dairy.description')}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{t('animals.dairy.dailyStats')}</p>
                  <p className="text-xl font-bold text-blue-600">50L</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{t('animals.dairy.cowCount')}</p>
                  <p className="text-xl font-bold text-blue-600">5</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate('/chicken')}
              className="bg-white p-8 rounded-xl shadow-md cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <GiChicken className="text-5xl text-orange-600" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{t('animals.poultry.title')}</h2>
                  <p className="text-gray-600">{t('animals.poultry.description')}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{t('animals.poultry.dailyStats')}</p>
                  <p className="text-xl font-bold text-orange-600">40</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{t('animals.poultry.birdCount')}</p>
                  <p className="text-xl font-bold text-orange-600">50</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Animals Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-700">Custom Animals</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Add New Animal
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading animals...</p>
            </div>
          ) : customAnimals.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
              <p className="text-gray-600">No custom animals added yet. Click "Add New Animal" to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customAnimals.map((animal) => (
                <div
                  key={animal.id}
                  onClick={() => navigate(`/animal/${animal.id}`)}
                  className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="mb-4">
                    <span className="text-4xl">{animal.icon || '🐾'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{animal.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">Type: {animal.animal_type}</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Total Count</p>
                    <p className="text-lg font-bold text-gray-800">{animal.count || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Animal Modal */}
        <AddAnimalModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAnimal}
        />
      </div>
    </div>
  );
};

export default Animals
