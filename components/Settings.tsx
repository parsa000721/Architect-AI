
import React from 'react';
import { AppSettings } from '../types';

interface SettingsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; }> = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-800 ${checked ? 'bg-primary-600' : 'bg-secondary-300 dark:bg-secondary-600'}`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);

const SettingsRow: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
    <div>
      <h4 className="font-semibold text-secondary-800 dark:text-secondary-200">{title}</h4>
      <p className="text-sm text-secondary-500">{description}</p>
    </div>
    {children}
  </div>
);

export const Settings: React.FC<SettingsProps> = ({ isDarkMode, onToggleDarkMode, settings, onUpdateSettings }) => {
  
  const handleDesignerSettingChange = (key: keyof AppSettings['designer'], value: boolean) => {
    onUpdateSettings({
      designer: {
        ...settings.designer,
        [key]: value,
      }
    });
  };
  
  const handleClearData = () => {
    if (window.confirm('क्या आप वाकई सभी स्थानीय डेटा (सहेजे गए डिज़ाइन और सेटिंग्स) को हटाना चाहते हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता।')) {
        localStorage.removeItem('architectAIPlan');
        localStorage.removeItem('architectAISettings');
        alert('स्थानीय डेटा साफ़ कर दिया गया है। एप्लिकेशन को रीफ़्रेश करने की सलाह दी जाती है।');
        window.location.reload();
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-5 border-b border-secondary-200 dark:border-secondary-700">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">सेटिंग्स</h2>
          <p className="text-secondary-500 mt-1">एप्लिकेशन वरीयताएँ और कॉन्फ़िगरेशन प्रबंधित करें।</p>
        </div>
        <div className="p-4 md:p-6 space-y-8">
            
            <section>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">दिखावट</h3>
                <div className="space-y-4">
                    <SettingsRow title="डार्क मोड" description="एक गहरी रंग योजना पर स्विच करें।">
                        <ToggleSwitch checked={isDarkMode} onChange={onToggleDarkMode} />
                    </SettingsRow>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">नक्शा डिज़ाइनर डिफॉल्ट्स</h3>
                <div className="space-y-4">
                    <SettingsRow title="ग्रिड डिफ़ॉल्ट रूप से दिखाएँ" description="डिज़ाइनर खोलने पर ग्रिड को स्वचालित रूप से दिखाएँ।">
                        <ToggleSwitch 
                            checked={settings.designer.defaultGridVisible} 
                            onChange={() => handleDesignerSettingChange('defaultGridVisible', !settings.designer.defaultGridVisible)} 
                        />
                    </SettingsRow>
                    <SettingsRow title="स्नैपिंग डिफ़ॉल्ट रूप से सक्षम करें" description="तत्वों को ग्रिड और अन्य तत्वों में स्नैप करें।">
                        <ToggleSwitch 
                           checked={settings.designer.defaultSnappingEnabled}
                           onChange={() => handleDesignerSettingChange('defaultSnappingEnabled', !settings.designer.defaultSnappingEnabled)}
                        />
                    </SettingsRow>
                </div>
            </section>

             <section>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">डेटा प्रबंधन</h3>
                 <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/30">
                    <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                        <div>
                            <h4 className="font-semibold text-red-800 dark:text-red-200">स्थानीय डेटा साफ़ करें</h4>
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                यह आपके ब्राउज़र से सभी सहेजे गए डिज़ाइन और कस्टम सेटिंग्स को स्थायी रूप से हटा देगा।
                            </p>
                        </div>
                        <button
                          onClick={handleClearData}
                          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-red-50 flex-shrink-0 transition-colors"
                        >
                          डेटा साफ़ करें
                        </button>
                    </div>
                </div>
            </section>

        </div>
      </div>
    </div>
  );
};
