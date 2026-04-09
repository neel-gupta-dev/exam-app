'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

import { UserPlus } from 'lucide-react';
import Link from 'next/link';

interface FollowSectionProps {
  targetVaultId: string;
  initialFollowersCount: number;
  followingCount: number;
}

export default function FollowSection({ targetVaultId, initialFollowersCount, followingCount }: FollowSectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);

  useEffect(() => {
    if (user && user.vaultId !== targetVaultId) {
      // Fetch initial follow status
      api.get(`/follow/status/${targetVaultId}`)
        .then((res) => {
          setIsFollowing(res.data.isFollowing);
        })
        .catch((err) => {
          console.error('Failed to fetch follow status', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user, targetVaultId]);

  if (user && user.vaultId === targetVaultId) {
    return null; // Cannot follow yourself
  }

  const handleFollowToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsUpdating(true);
    try {
      const { data } = await api.post('/follow/toggle', { targetVaultId });
      
      // Optimistic update of counts
      if (data.isFollowing && !isFollowing) {
        setFollowersCount(c => c + 1);
      } else if (!data.isFollowing && isFollowing) {
        setFollowersCount(c => Math.max(0, c - 1));
      }
      
      setIsFollowing(data.isFollowing);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update follow status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Follow Stats */}
      <div className="flex items-center justify-center md:justify-start gap-6 mb-8 text-sm">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline font-bold text-lg text-on-surface">{followersCount}</span>
          <span className="text-on-surface-variant opacity-70">Followers</span>
        </div>
        <div className="w-px h-8 bg-white/10"></div>
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline font-bold text-lg text-on-surface">{followingCount}</span>
          <span className="text-on-surface-variant opacity-70">Following</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start w-full">
        {user?.vaultId !== targetVaultId && (
          <button
            onClick={handleFollowToggle}
            disabled={isLoading || isUpdating}
            className={`min-w-[120px] px-6 py-2 rounded-xl font-headline font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
              isFollowing
                ? 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest border border-white/10'
                : 'bg-primary text-on-primary hover:bg-primary/90 shadow-primary/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isFollowing ? (
              <>
                <span className="material-symbols-outlined text-[18px]">person_check</span>
                Following
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Follow
              </>
            )}
          </button>
        )}
        
        <Link
          href="/signup"
          className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-br from-surface-container to-surface-container-high border border-white/5 text-on-surface font-headline font-bold rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group hover:bg-surface-container-highest"
        >
          <UserPlus className="w-4 h-4 opacity-70" />
          Create Your Vault
        </Link>
      </div>
    </>
  );
}
