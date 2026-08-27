import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  faUser, faMapMarkerAlt, faCreditCard, faWallet, faShieldAlt 
} from '@fortawesome/free-solid-svg-icons';

import useAppTranslation from '../hooks/useAppTranslation';
import Sidebar from '../components/UI/Sidebar';
import SidebarItem from '../components/UI/SidebarItem';

// * Import Sub-Tabs
import UserInfoTab from '../components/profile/UserInfoTab';
import AddressesTab from '../components/profile/AddressesTab';
import CardsTab from '../components/profile/CardsTab';

const Profile = () => {
  const { t } = useAppTranslation('profile');
  const currentUser = useSelector((state) => state.auth?.user); 
  const role = currentUser?.role || 'customer';
  const [activeTab, setActiveTab] = useState('info');

  const getSidebarItemsByRole = () => {
    switch (role) {
      case 'seller':
        return [
          { id: 'info', label: t('sidebar.personalInfo'), icon: faUser },
          { id: 'payout', label: t('sidebar.payoutCard'), icon: faWallet },
        ];
      case 'admin':
        return [
          { id: 'info', label: t('sidebar.adminInfo'), icon: faShieldAlt },
        ];
      case 'customer':
      default:
        return [
          { id: 'info', label: t('sidebar.personalInfo'), icon: faUser },
          { id: 'addresses', label: t('sidebar.addresses'), icon: faMapMarkerAlt },
          { id: 'cards', label: t('sidebar.paymentCards'), icon: faCreditCard },
        ];
    }
  };

  const sidebarItems = getSidebarItemsByRole();

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row gap-6 p-4 sm:p-6 md:p-8">
      {/* Sidebar Section */}
      <Sidebar
        title={t('sidebar.title')}
        subtitle={currentUser?.name || ''}
      >
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeTab === item.id}
            onClick={(id) => setActiveTab(id)}
          />
        ))}
      </Sidebar>

      {/* Main Content View Box */}
      <main className="flex-1 w-full bg-white dark:bg-[#0b1329] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {role === 'customer' && (
          <>
            {activeTab === 'info' && <UserInfoTab user={currentUser} />}
            {activeTab === 'addresses' && <AddressesTab userId={currentUser?.id} />}
            {activeTab === 'cards' && <CardsTab user={currentUser} />}
          </>
        )}

        {role === 'seller' && (
          <>
            {activeTab === 'info' && <UserInfoTab user={currentUser} />}
            {activeTab === 'payout' && <CardsTab user={currentUser} />}
          </>
        )}

        {role === 'admin' && (
          <>
            {activeTab === 'info' && <UserInfoTab user={currentUser} />}
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;