import React, { useState } from 'react';
import { X, Plus, Trash2, Image, Clock, TrendingUp } from 'lucide-react';
import axios from 'axios';

const CreatePollModal = ({ isOpen, onClose, onPollCreated, backendUrl, userToken, chatData }) => {
  const [pollData, setPollData] = useState({
    title: '',
    description: '',
    pollType: 'fashion_trend',
    category: 'general',
    allowMultipleVotes: false,
    showResults: 'after_voting',
    expiresIn: 24, // hours
    options: [
      { text: '', imageUrl: '' },
      { text: '', imageUrl: '' }
    ]
  });
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const pollTypes = [
    { value: 'fashion_trend', label: 'Fashion Trend', description: 'What\'s trending in fashion?' },
    { value: 'outfit_choice', label: 'Outfit Choice', description: 'Help choose the best outfit' },
    { value: 'color_preference', label: 'Color Preference', description: 'Which color looks better?' },
    { value: 'style_rating', label: 'Style Rating', description: 'Rate different styles' },
    { value: 'general', label: 'General Poll', description: 'Any other topic' }
  ];

  const categories = [
    { value: 'dress', label: '👗 Dresses' },
    { value: 'tops', label: '👚 Tops' },
    { value: 'bottoms', label: '👖 Bottoms' },
    { value: 'shoes', label: '👠 Shoes' },
    { value: 'accessories', label: '👜 Accessories' },
    { value: 'formal', label: '🤵 Formal Wear' },
    { value: 'casual', label: '👕 Casual Wear' },
    { value: 'party', label: '🎉 Party Wear' },
    { value: 'general', label: '📋 General' }
  ];

  const expiryOptions = [
    { value: 1, label: '1 hour' },
    { value: 6, label: '6 hours' },
    { value: 12, label: '12 hours' },
    { value: 24, label: '1 day' },
    { value: 48, label: '2 days' },
    { value: 168, label: '1 week' }
  ];

  const addOption = () => {
    if (pollData.options.length < 10) {
      setPollData(prev => ({
        ...prev,
        options: [...prev.options, { text: '', imageUrl: '' }]
      }));
    }
  };

  const removeOption = (index) => {
    if (pollData.options.length > 2) {
      setPollData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index, field, value) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!pollData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    const validOptions = pollData.options.filter(option => option.text.trim());
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      const validOptions = pollData.options.filter(option => option.text.trim());
      
      const pollPayload = {
        title: pollData.title.trim(),
        description: pollData.description.trim(),
        options: validOptions,
        pollType: pollData.pollType,
        category: pollData.category,
        allowMultipleVotes: pollData.allowMultipleVotes,
        showResults: pollData.showResults,
        expiresIn: pollData.expiresIn,
        chatType: chatData.chatType || 'direct',
        chatId: chatData.chatId,
        recipient: chatData.recipient
      };

      const response = await axios.post(
        `${backendUrl}/api/chat/polls/create`,
        pollPayload,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        onPollCreated(response.data);
        onClose();
        // Reset form
        setPollData({
          title: '',
          description: '',
          pollType: 'fashion_trend',
          category: 'general',
          allowMultipleVotes: false,
          showResults: 'after_voting',
          expiresIn: 24,
          options: [
            { text: '', imageUrl: '' },
            { text: '', imageUrl: '' }
          ]
        });
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      setErrors({ submit: 'Failed to create poll. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Create Fashion Poll</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poll Title *
            </label>
            <input
              type="text"
              value={pollData.title}
              onChange={(e) => setPollData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Which dress looks better for the party?"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={200}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={pollData.description}
              onChange={(e) => setPollData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add more details about your poll..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="2"
              maxLength={500}
            />
          </div>

          {/* Poll Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poll Type
            </label>
            <select
              value={pollData.pollType}
              onChange={(e) => setPollData(prev => ({ ...prev, pollType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {pollTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={pollData.category}
              onChange={(e) => setPollData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poll Options *
            </label>
            {errors.options && <p className="text-red-500 text-xs mb-2">{errors.options}</p>}
            
            <div className="space-y-2">
              {pollData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={100}
                    />
                  </div>
                  
                  {pollData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {pollData.options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add option</span>
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Poll Settings</h3>
            
            {/* Multiple votes */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={pollData.allowMultipleVotes}
                onChange={(e) => setPollData(prev => ({ ...prev, allowMultipleVotes: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Allow multiple choices</span>
            </label>

            {/* Show results */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Show results
              </label>
              <select
                value={pollData.showResults}
                onChange={(e) => setPollData(prev => ({ ...prev, showResults: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="after_voting">After voting</option>
                <option value="always">Always</option>
                <option value="after_end">After poll ends</option>
              </select>
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Poll expires in
              </label>
              <select
                value={pollData.expiresIn}
                onChange={(e) => setPollData(prev => ({ ...prev, expiresIn: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {expiryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isCreating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span>{isCreating ? 'Creating...' : 'Create Poll'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;