import React, { useState } from 'react';
import { UserProfile, CustomReward } from '../types';
import { BADGES } from '../constants';
import { StarIcon } from './Icon';

interface RewardsViewProps {
  userProfile: UserProfile;
  customRewards: CustomReward[];
  onAddReward: (reward: Omit<CustomReward, 'id'>) => void;
  onRedeemReward: (rewardId: string) => void;
}

const BadgeCard: React.FC<{
  badge: typeof BADGES[0];
  isUnlocked: boolean;
}> = ({ badge, isUnlocked }) => {
    const Icon = badge.icon;
    return (
        <div className={`p-4 rounded-lg shadow-sm flex items-center space-x-4 transition-all ${isUnlocked ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800/50 opacity-60'}`}>
            <div className={`p-3 rounded-full ${isUnlocked ? 'bg-yellow-100 text-yellow-500 dark:bg-yellow-500/10 dark:text-yellow-400' : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
                <Icon className="h-8 w-8" />
            </div>
            <div>
                <h4 className={`font-bold ${isUnlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{badge.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{badge.description}</p>
            </div>
        </div>
    );
};

export const RewardsView: React.FC<RewardsViewProps> = ({ userProfile, customRewards, onAddReward, onRedeemReward }) => {
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('');

  const handleAddRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseInt(newRewardCost, 10);
    if (newRewardName.trim() && !isNaN(cost) && cost > 0) {
      onAddReward({ name: newRewardName, cost });
      setNewRewardName('');
      setNewRewardCost('');
    }
  };

  return (
    <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Your Rewards</h2>

        <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BADGES.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} isUnlocked={badge.threshold([], userProfile)} />
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Custom Rewards</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold mb-4 dark:text-gray-200">Redeem a Reward</h4>
                    {customRewards.length > 0 ? (
                        <div className="space-y-3">
                            {customRewards.map(reward => (
                                <div key={reward.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md gap-2">
                                    <div>
                                        <p className="font-medium dark:text-gray-200">{reward.name}</p>
                                        <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                                            <StarIcon className="h-4 w-4 mr-1" />
                                            <span>{reward.cost} Points</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onRedeemReward(reward.id)}
                                        disabled={userProfile.points < reward.cost}
                                        className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                                    >
                                        Redeem
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500 dark:text-gray-400">No custom rewards yet. Add one!</p>}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold mb-4 dark:text-gray-200">Create Your Own Reward</h4>
                    <form onSubmit={handleAddRewardSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="rewardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reward Name</label>
                            <input
                                type="text"
                                id="rewardName"
                                value={newRewardName}
                                onChange={e => setNewRewardName(e.target.value)}
                                placeholder="e.g., Manicure"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="rewardCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Point Cost</label>
                            <input
                                type="number"
                                id="rewardCost"
                                value={newRewardCost}
                                onChange={e => setNewRewardCost(e.target.value)}
                                placeholder="e.g., 500"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                            Add Reward
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};