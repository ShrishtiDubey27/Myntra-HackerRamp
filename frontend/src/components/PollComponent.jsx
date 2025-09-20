import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Shirt, User, Check, X } from 'lucide-react';
import axios from 'axios';

const PollComponent = ({ poll, onVote, backendUrl, userToken, currentUserId }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [pollData, setPollData] = useState(poll);

  useEffect(() => {
    const fetchLatestPollData = async () => {
      if (poll?._id) {
        try {
          const response = await axios.get(
            `${backendUrl}/api/chat/polls/${poll._id}`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              }
            }
          );
          if (response.data.success) {
            setPollData(response.data.poll);
            setSelectedOptions(response.data.poll.userVotes?.map(vote => vote.optionId) || []);
            setShowResults(response.data.poll.canSeeResults || false);
          }
        } catch (error) {
          console.error('Error fetching poll data:', error);
          // Fallback to message poll data
          setPollData(poll);
          setSelectedOptions(poll.userVotes?.map(vote => vote.optionId) || []);
          setShowResults(poll.canSeeResults || false);
        }
      } else {
        setPollData(poll);
        setSelectedOptions(poll.userVotes?.map(vote => vote.optionId) || []);
        setShowResults(poll.canSeeResults || false);
      }
    };

    fetchLatestPollData();
  }, [poll, backendUrl, userToken]);

  const handleVote = async (optionId) => {
    if (isVoting || pollData.isExpired) return;

    console.log('Poll data:', pollData);
    console.log('Option ID:', optionId);
    console.log('Poll ID:', pollData._id);

    setIsVoting(true);
    try {
      const isAlreadyVoted = selectedOptions.includes(optionId);
      
      if (isAlreadyVoted) {
        // Remove vote
        const response = await axios.post(
          `${backendUrl}/api/chat/polls/remove-vote`,
          {
            pollId: pollData._id,
            optionId: optionId
          },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setSelectedOptions(prev => prev.filter(id => id !== optionId));
          setPollData(response.data.poll);
          if (onVote) onVote(response.data.poll);
        }
      } else {
        // Add vote
        const response = await axios.post(
          `${backendUrl}/api/chat/polls/vote`,
          {
            pollId: pollData._id,
            optionId: optionId
          },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          if (!pollData.allowMultipleVotes) {
            setSelectedOptions([optionId]);
          } else {
            setSelectedOptions(prev => [...prev, optionId]);
          }
          setPollData(response.data.poll);
          setShowResults(true);
          if (onVote) onVote(response.data.poll);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setIsVoting(false);
    }
  };

  const getTimeRemaining = () => {
    if (!pollData.expiresAt) return 'No expiry';
    
    const now = new Date();
    const expiry = new Date(pollData.expiresAt);
    const timeDiff = expiry - now;

    if (timeDiff <= 0) return 'Expired';

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getCategoryIcon = () => {
    switch (pollData.category) {
      case 'dress':
      case 'tops':
      case 'bottoms':
        return <Shirt className="w-4 h-4" />;
      case 'accessories':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getPollTypeLabel = () => {
    switch (pollData.pollType) {
      case 'fashion_trend':
        return 'Fashion Trend';
      case 'outfit_choice':
        return 'Outfit Choice';
      case 'color_preference':
        return 'Color Preference';
      case 'style_rating':
        return 'Style Rating';
      default:
        return 'General Poll';
    }
  };

  const getOptionPercentage = (option) => {
    if (!showResults || !pollData.totalVotes) return 0;
    return Math.round((option.voteCount / pollData.totalVotes) * 100);
  };

  const isCreator = pollData.creator && pollData.creator._id === currentUserId;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 max-w-md mx-auto shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getCategoryIcon()}
          <span className="text-sm font-medium text-gray-600">
            {getPollTypeLabel()}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{getTimeRemaining()}</span>
        </div>
      </div>

      {/* Creator Info */}
      {pollData.creator && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-purple-600" />
          </div>
          <span className="text-sm text-gray-600">
            {isCreator 
              ? 'You' 
              : `${pollData.creator.firstName || ''} ${pollData.creator.lastName || ''}`.trim() || 'Anonymous'
            }
          </span>
        </div>
      )}

      {/* Title and Description */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-1">{pollData.title}</h3>
        {pollData.description && (
          <p className="text-sm text-gray-600">{pollData.description}</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {pollData.options?.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const percentage = getOptionPercentage(option);
          const isDisabled = pollData.isExpired || (!pollData.allowMultipleVotes && selectedOptions.length > 0 && !isSelected);

          return (
            <div
              key={option.id}
              className={`relative border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-purple-500 bg-purple-50'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
              }`}
              onClick={() => !isDisabled && handleVote(option.id)}
            >
              {/* Progress bar background for results */}
              {showResults && (
                <div
                  className="absolute inset-0 bg-purple-100 rounded-lg transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Option image if available */}
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt={option.text}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  )}
                  
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800">
                      {option.text}
                    </span>
                    {showResults && (
                      <div className="text-xs text-gray-600 mt-1">
                        {option.voteCount || 0} vote{(option.voteCount || 0) !== 1 ? 's' : ''} 
                        {percentage > 0 && ` (${percentage}%)`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isSelected && (
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {showResults && percentage > 0 && (
                    <span className="text-sm font-bold text-purple-600">
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {showResults && (
            <span>{pollData.totalVotes || 0} total vote{(pollData.totalVotes || 0) !== 1 ? 's' : ''}</span>
          )}
          {pollData.allowMultipleVotes && (
            <span className="text-purple-600">Multiple choices allowed</span>
          )}
        </div>
        
        {pollData.isExpired && (
          <div className="flex items-center space-x-1 text-red-500">
            <X className="w-3 h-3" />
            <span>Expired</span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isVoting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
        </div>
      )}
    </div>
  );
};

export default PollComponent;
