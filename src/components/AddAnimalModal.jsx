import React, { useState } from 'react';

const AddAnimalModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    animal_type: '',
    count: 0,
    icon: '🐾'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const animalTypes = [
    { name: 'Cow', emoji: '🐄' },
    { name: 'Hen', emoji: '🐔' },
    { name: 'Goat', emoji: '🐐' },
    { name: 'Ox', emoji: '🐂' },
    { name: 'Sheep', emoji: '🐑' },
    { name: 'Buffalo', emoji: '🐃' },
    { name: 'Horse', emoji: '🐴' },
    { name: 'Pig', emoji: '🐷' },
    { name: 'Duck', emoji: '🦆' },
    { name: 'Turkey', emoji: '🦃' },
    { name: 'Donkey', emoji: '🫏' },
    { name: 'Camel', emoji: '🐫' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'count' ? parseInt(value) || 0 : value
    }));
  };

  const handleAnimalTypeSelect = (type, emoji) => {
    setFormData(prev => ({
      ...prev,
      animal_type: type,
      icon: emoji
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Please enter an animal name');
      return;
    }

    if (!formData.animal_type.trim()) {
      setError('Please select an animal type');
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        ...formData,
        created_at: new Date().toISOString()
      });
      // Reset form
      setFormData({
        name: '',
        animal_type: '',
        count: 0,
        icon: '🐾'
      });
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to add animal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold">Add New Animal</h2>
          <p className="text-red-100 text-sm mt-1">Create a new animal entry and track its details</p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
              <p className="text-red-700 font-semibold flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Animal Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Animal Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Bessie, Cluck, Billy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={loading}
            />
          </div>

          {/* Animal Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Animal Type
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {animalTypes.map((type) => (
                <button
                  key={type.name}
                  type="button"
                  onClick={() => handleAnimalTypeSelect(type.name, type.emoji)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.animal_type === type.name
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <div className="text-3xl mb-1">{type.emoji}</div>
                  <div className="text-xs font-semibold text-gray-700">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Initial Count
            </label>
            <input
              type="number"
              name="count"
              value={formData.count}
              onChange={handleInputChange}
              min="0"
              placeholder="Number of animals"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={loading}
            />
          </div>

          {/* Selected Details */}
          {formData.animal_type && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Selected Details:</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{formData.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{formData.name || 'Animal Name'}</p>
                  <p className="text-sm text-gray-600">Type: {formData.animal_type} | Count: {formData.count}</p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnimalModal;
