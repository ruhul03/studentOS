import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useUser } from '../hooks/useUser';
import { useProfileMutations } from '../hooks/useProfileMutations';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { DeleteProfileModal } from '../components/profile/DeleteProfileModal';
import { ArrowLeft, User as UserIcon, Edit3, CreditCard, Contact, FileText, Shield, Trash2 } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('viewUserId');
  const activeUserId = userId || queryUserId;
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewedUser, setViewedUser] = useState(null);

  const isOwnProfile = !activeUserId || activeUserId === user?.id;

  const { data: fetchedUser, isLoading, isError, error: queryError, refetch } = useUser(activeUserId, user, isOwnProfile);
  const { updateProfile, isUpdating, deleteProfile, isDeleting } = useProfileMutations();

  useEffect(() => {
    if (fetchedUser) {
      setViewedUser(fetchedUser);
    }
  }, [fetchedUser]);

  if (isLoading) return <LoadingState message="Loading profile..." fullScreen={true} />;
  
  if (isError) return (
    <div className="flex-1 p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
      <ErrorState error={queryError} onRetry={refetch} title="Failed to Load Profile" />
    </div>
  );
  
  if (!viewedUser) return (
    <div className="flex-1 p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
      <ErrorState error="User not found" title="Profile Not Found" />
    </div>
  );

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full h-full overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      {(!isOwnProfile || userId) && (
        <button 
          className="mb-6 flex items-center gap-2 text-outline hover:text-white transition-colors text-sm font-medium cursor-pointer" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} /> Back
        </button>
      )}

      {/* Profile Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 relative z-10">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-surface-variant bg-surface-container flex items-center justify-center relative">
            {viewedUser?.profilePicture ? (
              <img src={viewedUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-outline flex items-center justify-center">
                <UserIcon size={64} strokeWidth={1} />
              </div>
            )}
          </div>
        </div>
        
        {/* Title & Primary Actions */}
        <div className="flex-1 text-center md:text-left pt-2">
          <h1 className="font-h1 text-h1 text-on-surface mb-2">{viewedUser?.username}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
            {viewedUser?.department ? `${viewedUser.department} Undergraduate` : 'Student'}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            {isOwnProfile && (
              <button 
                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-body-sm text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_4px_20px_rgba(192,193,255,0.2)] cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={18} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid - Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Detail Card 1: ID & Batch */}
        <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 hover:bg-surface-bright transition-colors shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <CreditCard size={24} />
            <h3 className="font-h3 text-h3 text-on-surface">Academic Identity</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Student ID</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.studentId || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Batch</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.batch ? `Class of ${viewedUser.batch}` : 'Not specified'}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Department</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.department || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Detail Card 2: Contact Info */}
        <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 hover:bg-surface-bright transition-colors shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Contact size={24} />
            <h3 className="font-h3 text-h3 text-on-surface">Contact Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">University Email</p>
              <p className="font-body-lg text-sm text-on-surface truncate">{viewedUser?.email}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Username</p>
              <p className="font-body-lg text-sm text-on-surface truncate">{viewedUser?.username}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Phone / WhatsApp</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.phoneNumber || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Date of Birth</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.dateOfBirth ? new Date(viewedUser.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 hover:bg-surface-bright transition-colors shadow-sm mb-12">
        <div className="flex items-center gap-3 mb-4 text-primary">
          <FileText size={24} />
          <h3 className="font-h3 text-h3 text-on-surface">Biography</h3>
        </div>
        <p className="font-body-lg text-sm text-on-surface-variant leading-relaxed">
          {viewedUser?.bio || 'This student hasn\'t added a biography yet.'}
        </p>
      </div>

      {/* Danger Zone */}
      {isOwnProfile && (
        <div className="border-t border-error-container/30 pt-8 mt-12 mb-8">
          <h3 className="font-h3 text-h3 text-error mb-4">Danger Zone</h3>
          <div className="bg-surface-container-high border border-error-container/50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-body-lg text-base font-semibold text-on-surface mb-1">Delete Account</p>
              <p className="font-body-sm text-sm text-on-surface-variant">Once you delete your account, there is no going back. Please be certain.</p>
              <p className="text-xs text-outline mt-2 flex items-center gap-1">
                <Shield size={14} />
                Changes remaining: {Math.max(0, 2 - (user?.updateCount || 0))}
              </p>
            </div>
            <button 
              className="shrink-0 bg-transparent border border-error text-error hover:bg-error hover:text-on-error px-6 py-2.5 rounded-lg font-body-sm text-sm transition-colors flex items-center gap-2 cursor-pointer"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        <EditProfileModal 
          isOpen={isEditing} 
          onClose={() => setIsEditing(false)} 
          onSave={updateProfile} 
          initialData={viewedUser}
          isUpdating={isUpdating}
        />
        <DeleteProfileModal 
          isOpen={showDeleteConfirm} 
          onClose={() => setShowDeleteConfirm(false)} 
          onDelete={deleteProfile}
          isDeleting={isDeleting}
        />
      </AnimatePresence>
    </div>
  );
}
