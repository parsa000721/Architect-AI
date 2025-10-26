
import React, { useState, useMemo } from 'react';

const MATERIAL_RATES = {
    'ईंटें': { factor: 50, unit: 'प्रति वर्ग मीटर' },
    'सीमेंट': { factor: 0.5, unit: 'बैग प्रति वर्ग मीटर' },
    'रेत': { factor: 1.5, unit: 'घन फीट प्रति वर्ग मीटर' },
    'स्टील': { factor: 2.5, unit: 'किग्रा प्रति वर्ग मीटर' },
};

type MaterialKey = keyof typeof MATERIAL_RATES;

export const MaterialEstimator: React.FC = () => {
    const [length, setLength] = useState(10);
    const [width, setWidth] = useState(12);
    const [height, setHeight] = useState(10);

    const area = useMemo(() => length * width, [length, width]);
    const wallArea = useMemo(() => 2 * (length + width) * height, [length, width, height]);

    const estimates = useMemo(() => {
        return (Object.keys(MATERIAL_RATES) as MaterialKey[]).map(material => {
            const rateInfo = MATERIAL_RATES[material];
            const quantity = (material === 'ईंटें' || material === 'सीमेंट') ? wallArea * rateInfo.factor : area * rateInfo.factor;
            return {
                name: material,
                quantity: quantity.toFixed(2),
                unit: rateInfo.unit
            };
        });
    }, [area, wallArea]);

    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">सामग्री अनुमानक</h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">आवश्यक निर्माण सामग्री का अनुमान लगाने के लिए कमरे के आयाम दर्ज करें।</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
                <div>
                    <label htmlFor="length" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">लंबाई (फीट)</label>
                    <input type="number" id="length" value={length} onChange={(e) => setLength(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="width" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">चौड़ाई (फीट)</label>
                    <input type="number" id="width" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">ऊंचाई (फीट)</label>
                    <input type="number" id="height" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
            </div>

            <div>
                <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-4">अनुमानित मात्रा</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                      <thead className="bg-secondary-50 dark:bg-secondary-700/50">
                          <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">सामग्री</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">अनुमानित मात्रा</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">इकाई</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
                          {estimates.map((item, index) => (
                              <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900 dark:text-white">{item.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-300">{item.quantity}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">{item.unit}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                </div>
            </div>
        </div>
    );
};
