'use client';

import { useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/lib/context/auth-context';
import { AvatarGenerator } from '@/components/settings/AvatarGenerator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { Loader2, Save, Key, User as UserIcon } from 'lucide-react';

export default function SettingsPage() {
  const { user, login } = useAuth(); // We might need a way to refresh user data in context
  const [isLoading, setIsLoading] = useState(false);

  // Profile Form State
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.updateProfile({ name: displayName, avatar: avatarUrl });
      toast.success('Profile updated successfully');
      // Ideally trigger a user refresh here, but for now page reload or context update would be needed
      // Assuming auth context might not auto-refresh, we could force a reload or just let it be
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to change password. Check your current password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleAvatarGenerated = (url: string) => {
    setAvatarUrl(url);
    toast.success('Avatar generated! Click "Save Changes" to apply.');
  };

  return (
    <PageShell title="Profile & Settings" description="Manage your account settings and preferences">
      <div className="space-y-8 max-w-4xl">

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-cyan-500" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your public profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Display Name</label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your Name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="mt-1 bg-slate-800/50 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </div>

                {/* Avatar Section */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col items-center gap-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 shadow-xl bg-slate-800">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <UserIcon size={48} />
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <AvatarGenerator onGenerate={handleAvatarGenerated} />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-500" />
              Change Password
            </CardTitle>
            <CardDescription>Ensure your account is secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium text-slate-300">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="submit" variant="outline" disabled={isPasswordLoading}>
                {isPasswordLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your InFocus experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Preferences settings coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
